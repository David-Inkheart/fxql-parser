import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomThrottlerGuard } from './throttler/custom-throttler.gaurd';

@Module({
  imports: [
    FxqlModule,
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(5),
          limit: 5,
          blockDuration: seconds(5),
        },
      ],
      storage: new ThrottlerStorageRedisService(new Redis()),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
