import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { FindMatchesUseCase } from '@/domains/matching/use-cases/find-matches.use-case'

@ApiTags('matching')
@Controller('lost-items/:id/matches')
export class MatchingController {
	constructor(private readonly findMatchesUseCase: FindMatchesUseCase) {}

	@Get()
	@AllowAnonymous()
	findMatches(@Param('id') id: string) {
		return this.findMatchesUseCase.execute(id)
	}
}
