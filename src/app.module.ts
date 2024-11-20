import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomThrottlerGuard } from './throttler/custom-throttler.gaurd';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        THROTTLER_TTL: Joi.number().required(),
        THROTTLER_LIMIT: Joi.number().required(),
        THROTTLER_BLOCK_DURATION: Joi.number().required(),
      }),
    }),
    FxqlModule,
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(parseInt(process.env.THROTTLER_TTL, 10)),
          limit: parseInt(process.env.THROTTLER_LIMIT, 10),
          blockDuration: seconds(
            parseInt(process.env.THROTTLER_BLOCK_DURATION, 10),
          ),
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
