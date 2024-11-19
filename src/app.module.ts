import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { FxqlModule } from './fxql/fxql.module';

@Module({
  imports: [PrismaModule, FxqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
