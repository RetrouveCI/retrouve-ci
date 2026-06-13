import { Module } from '@nestjs/common'
import { MatchingUseCases } from '@/domains/matching/use-cases/matching.use-cases'
import { LostItemsModule } from '@/presentation/lost-items/lost-items.module'
import { MatchingController } from './controllers/matching.controller'

@Module({
	imports: [LostItemsModule],
	controllers: [MatchingController],
	providers: [MatchingUseCases],
})
export class MatchingModule {}
