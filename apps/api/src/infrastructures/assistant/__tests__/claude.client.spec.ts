import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ConfigService } from '@nestjs/config'
import { ASSISTANT_MODEL, AssistantConfig } from '../assistant.config'
import { ClaudeClient } from '../claude.client'

const { create } = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock('@anthropic-ai/sdk', () => ({
	default: class {
		messages = { create }
	},
}))

function configWith(values: Record<string, string | undefined>) {
	return new AssistantConfig({
		get: (name: string) => values[name],
	} as unknown as ConfigService)
}

const clientWith = (values: Record<string, string | undefined>) =>
	new ClaudeClient(configWith(values))

const KEYED = { ANTHROPIC_API_KEY: 'sk-test' }

const textBlocks = (...texts: string[]) => ({
	content: texts.map(text => ({ type: 'text', text })),
})

beforeEach(() => {
	create.mockReset().mockResolvedValue(textBlocks('{"type":"lost"}'))
})

describe('the assistant configuration', () => {
	it('resolves when the key is set', () => {
		expect(configWith(KEYED).isConfigured).toBe(true)
	})

	it('is unconfigured without a key, and does not throw for it', () => {
		expect(configWith({}).isConfigured).toBe(false)
	})

	// Unlike `LetextoConfig`: the assistant is an addition to a search that works
	// without it, so booting is never traded for a repli.
	it('stays unconfigured in production rather than refusing to start', () => {
		expect(() => configWith({ NODE_ENV: 'production' })).not.toThrow()
	})

	it('reads Haiku by default', () => {
		expect(configWith(KEYED).settings?.model).toBe(ASSISTANT_MODEL)
	})

	it('takes another model when one is named', () => {
		const settings = configWith({
			...KEYED,
			ASSISTANT_MODEL: 'claude-sonnet-5',
		}).settings

		expect(settings?.model).toBe('claude-sonnet-5')
	})

	it('ignores a blank override rather than asking for an empty model', () => {
		const settings = configWith({ ...KEYED, ASSISTANT_MODEL: '  ' }).settings

		expect(settings?.model).toBe(ASSISTANT_MODEL)
	})
})

describe('the extraction call', () => {
	it('answers unconfigured without reaching the gateway', async () => {
		const outcome = await clientWith({}).extract('invite', 'ma carte')

		expect(outcome).toEqual({ status: 'unconfigured' })
		expect(create).not.toHaveBeenCalled()
	})

	it('sends the invite as the system prompt and the phrase as the message', async () => {
		await clientWith(KEYED).extract('invite', 'ma carte')

		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				model: ASSISTANT_MODEL,
				system: 'invite',
				messages: [{ role: 'user', content: 'ma carte' }],
			}),
		)
	})

	it('joins the text blocks it is given', async () => {
		create.mockResolvedValue(textBlocks('{"type":', '"lost"}'))

		const outcome = await clientWith(KEYED).extract('invite', 'ma carte')

		expect(outcome).toEqual({ status: 'extracted', text: '{"type":"lost"}' })
	})

	it('ignores a block that is not text', async () => {
		create.mockResolvedValue({
			content: [
				{ type: 'thinking', thinking: 'hmm' },
				...textBlocks('{}').content,
			],
		})

		const outcome = await clientWith(KEYED).extract('invite', 'ma carte')

		expect(outcome).toEqual({ status: 'extracted', text: '{}' })
	})

	it('fails rather than answering an empty extraction', async () => {
		create.mockResolvedValue({ content: [] })

		const outcome = await clientWith(KEYED).extract('invite', 'ma carte')

		expect(outcome).toEqual({ status: 'failed' })
	})

	// A gateway that throws would turn a degraded search into a 500 on a route
	// a visitor is waiting on.
	it('swallows a refusal from the gateway', async () => {
		create.mockRejectedValue(new Error('429 rate limited'))

		const outcome = await clientWith(KEYED).extract('invite', 'ma carte')

		expect(outcome).toEqual({ status: 'failed' })
	})
})
