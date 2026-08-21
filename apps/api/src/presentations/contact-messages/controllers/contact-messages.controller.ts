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
import { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('contact-messages')
@ApiBearerAuth()
@Controller('contact-messages')
export class ContactMessagesController {
	constructor(
		private readonly contactMessageUseCases: ContactMessageUseCases,
	) {}

	@Post()
	@AllowAnonymous()
	@ApiZodBody(createContactMessageSchema)
	create(
		@Body(new ZodValidationPipe(createContactMessageSchema))
		data: CreateContactMessageData,
	) {
		return this.contactMessageUseCases.create(data)
	}

	@Get()
	@Roles(['admin'])
	@ApiZodQuery(listContactMessagesFilterSchema)
	list(
		@Query(new ZodValidationPipe(listContactMessagesFilterSchema))
		filter: ListContactMessagesFilterData,
	) {
		return this.contactMessageUseCases.list(filter)
	}

	@Get(':id')
	@Roles(['admin'])
	getOne(@Param('id') id: string) {
		return this.contactMessageUseCases.getOne(id)
	}

	@Patch(':id/status')
	@Roles(['admin'])
	@ApiZodBody(updateContactMessageStatusSchema)
	updateStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateContactMessageStatusSchema))
		data: UpdateContactMessageStatusData,
	) {
		return this.contactMessageUseCases.updateStatus(id, data.status)
	}
}
