import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [PrismaModule, PredictionsModule],
  providers: [SyncService],
})
export class SyncModule {}
