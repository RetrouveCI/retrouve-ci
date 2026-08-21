import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { MatchingUseCases } from '@/domains/matching/use-cases/matching.use-cases'

@ApiTags('matching')
@Controller('lost-items/:id/matches')
export class MatchingController {
	constructor(private readonly matchingUseCases: MatchingUseCases) {}

	@Get()
	@AllowAnonymous()
	findMatches(@Param('id') id: string) {
		return this.matchingUseCases.findMatches(id)
	}
}
