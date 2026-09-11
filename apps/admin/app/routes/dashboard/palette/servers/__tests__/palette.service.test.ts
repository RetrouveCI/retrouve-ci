const { listOrders, listQrTokens, listContactMessages, searchUsers } =
	vi.hoisted(() => ({
		listOrders: vi.fn(),
		listQrTokens: vi.fn(),
		listContactMessages: vi.fn(),
		searchUsers: vi.fn(),
	}))

vi.mock('../../../orders/servers/orders.service', () => ({ listOrders }))
vi.mock('../../../qr/servers/qr.service', () => ({ listQrTokens }))
vi.mock('../../../contact-messages/servers/contact-messages.service', () => ({
	listContactMessages,
}))
vi.mock('../../../users/servers/users.service', () => ({ searchUsers }))

const { searchPalette } = await import('../palette.service')

const request = new Request('http://localhost:3001/palette?q=kon')
const page = (items: unknown[]) => ({ items, total: items.length })

beforeEach(() => {
	listOrders.mockReset().mockResolvedValue(page([]))
	listQrTokens.mockReset().mockResolvedValue(page([]))
	listContactMessages.mockReset().mockResolvedValue(page([]))
	searchUsers.mockReset().mockResolvedValue([])
})

describe('searchPalette', () => {
	it('asks every source for five rows of the query', async () => {
		await searchPalette('kon', request)

		const slice = { search: 'kon', page: 1, pageSize: 5 }

		expect(listOrders).toHaveBeenCalledWith(slice, request)
		expect(listQrTokens).toHaveBeenCalledWith(slice, request)
		expect(listContactMessages).toHaveBeenCalledWith(slice, request)
		expect(searchUsers).toHaveBeenCalledWith(request, 'kon', 5)
	})

	it('points each hit where the backoffice can open it', async () => {
		listOrders.mockResolvedValue(
			page([
				{
					id: 'ord-1',
					orderNumber: 'RCI-2026-0042',
					packName: 'Pack Famille',
					deliveryCity: 'Abidjan',
				},
			]),
		)
		listQrTokens.mockResolvedValue(
			page([{ code: 'RCI-7K2M4P', status: 'activated' }]),
		)
		listContactMessages.mockResolvedValue(
			page([{ id: 'msg-1', name: 'Konan Aya', subject: 'Activation' }]),
		)
		searchUsers.mockResolvedValue([
			{ id: 'user-1', name: 'Konan Yao', phone: '+2250712668307' },
		])

		expect(await searchPalette('kon', request)).toEqual([
			{
				kind: 'order',
				id: 'ord-1',
				label: 'Commande RCI-2026-0042',
				detail: 'Pack Famille · Abidjan',
				to: '/orders?q=RCI-2026-0042',
			},
			{
				kind: 'sticker',
				id: 'RCI-7K2M4P',
				label: 'RCI-7K2M4P',
				detail: 'sticker · activé',
				to: '/qr/RCI-7K2M4P',
			},
			{
				kind: 'message',
				id: 'msg-1',
				label: 'Konan Aya — Activation',
				detail: 'message',
				to: '/contact-messages?q=kon',
			},
			{
				kind: 'user',
				id: 'user-1',
				label: 'Konan Yao',
				detail: '+2250712668307',
				to: '/users/user-1',
			},
		])
	})

	// Three kinds are still a palette; a blank one would read as « no match ».
	it('keeps the other kinds when one source fails', async () => {
		listOrders.mockRejectedValue(new Error('down'))
		listQrTokens.mockResolvedValue(
			page([{ code: 'RCI-7K2M4P', status: 'generated' }]),
		)

		const hits = await searchPalette('kon', request)

		expect(hits.map(hit => hit.kind)).toEqual(['sticker'])
	})
})

// The mocks hoist above the import under test, so the file must be a module.
export {}
