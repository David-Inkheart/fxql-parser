// src/app.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    FxqlModule,
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'fxql',
          limit: 100,
          ttl: 60,
          blockDuration: 60,
        },
      ],
    }),
  ],
})
export class AppModule {}
