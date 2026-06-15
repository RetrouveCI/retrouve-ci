import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { ContactMessageUseCases } from '@/domains/contact-messages/use-cases/contact-message.use-cases'
import { CreateContactMessageDto } from '../dto/create-contact-message.dto'
import { ListContactMessagesQueryDto } from '../dto/list-contact-messages.query.dto'
import { UpdateContactMessageStatusDto } from '../dto/update-contact-message-status.dto'

@ApiTags('contact-messages')
@ApiBearerAuth()
@Controller('contact-messages')
export class ContactMessagesController {
	constructor(
		private readonly contactMessageUseCases: ContactMessageUseCases,
	) {}

	@Post()
	@AllowAnonymous()
	create(@Body() dto: CreateContactMessageDto) {
		return this.contactMessageUseCases.create(dto)
	}

	@Get()
	@Roles(['admin'])
	list(@Query() query: ListContactMessagesQueryDto) {
		return this.contactMessageUseCases.list(query)
	}

	@Get(':id')
	@Roles(['admin'])
	getOne(@Param('id') id: string) {
		return this.contactMessageUseCases.getOne(id)
	}

	@Patch(':id/status')
	@Roles(['admin'])
	updateStatus(
		@Param('id') id: string,
		@Body() dto: UpdateContactMessageStatusDto,
	) {
		return this.contactMessageUseCases.updateStatus(id, dto.status)
	}
}
