import { Module } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [FxqlService, PrismaService],
  controllers: [FxqlController],
})
export class FxqlModule {}
