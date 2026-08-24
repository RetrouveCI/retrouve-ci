import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	createContactMessageSchema,
	listContactMessagesFilterSchema,
	updateContactMessageStatusSchema,
	type CreateContactMessageData,
	type ListContactMessagesFilterData,
	type UpdateContactMessageStatusData,
} from '@app/contracts/contact-messages'
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { CreateContactMessageUseCase } from '@/domains/contact-messages/use-cases/create-contact-message.use-case'
import { GetContactMessageUseCase } from '@/domains/contact-messages/use-cases/get-contact-message.use-case'
import { GetPaginatedContactMessagesUseCase } from '@/domains/contact-messages/use-cases/get-paginated-contact-messages.use-case'
import { UpdateContactMessageStatusUseCase } from '@/domains/contact-messages/use-cases/update-contact-message-status.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('contact-messages')
@ApiBearerAuth()
@Controller('contact-messages')
export class ContactMessagesController {
	constructor(
		private readonly createContactMessage: CreateContactMessageUseCase,
		private readonly getPaginatedContactMessages: GetPaginatedContactMessagesUseCase,
		private readonly getContactMessage: GetContactMessageUseCase,
		private readonly updateContactMessageStatus: UpdateContactMessageStatusUseCase,
	) {}

	@Post()
	@AllowAnonymous()
	@ApiZodBody(createContactMessageSchema)
	create(
		@Body(new ZodValidationPipe(createContactMessageSchema))
		data: CreateContactMessageData,
	) {
		return this.createContactMessage.execute(data)
	}

	@Get()
	@Roles(['admin'])
	@ApiZodQuery(listContactMessagesFilterSchema)
	list(
		@Query(new ZodValidationPipe(listContactMessagesFilterSchema))
		filter: ListContactMessagesFilterData,
	) {
		return this.getPaginatedContactMessages.execute(filter)
	}

	@Get(':id')
	@Roles(['admin'])
	getOne(@Param('id') id: string) {
		return this.getContactMessage.execute(id)
	}

	@Patch(':id/status')
	@Roles(['admin'])
	@ApiZodBody(updateContactMessageStatusSchema)
	updateStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateContactMessageStatusSchema))
		data: UpdateContactMessageStatusData,
	) {
		return this.updateContactMessageStatus.execute({ id, status: data.status })
	}
}
