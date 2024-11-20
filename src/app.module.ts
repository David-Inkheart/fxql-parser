import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomThrottlerGuard } from './throttler/custom-throttler.guard';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import * as Joi from 'joi';
import Redis from 'ioredis';

@Module({
  imports: [
    // load and validate environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        DATABASE_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_USERNAME: Joi.string().required(),
        REDIS_DB: Joi.number().required(),
        THROTTLER_TTL: Joi.number().required(),
        THROTTLER_LIMIT: Joi.number().required(),
        THROTTLER_BLOCK_DURATION: Joi.number().required(),
      }),
    }),

    // import Modules
    RedisModule,
    FxqlModule,
    PrismaModule,

    // configure Rate Limiting
    ThrottlerModule.forRootAsync({
      useFactory: (redis: Redis) => ({
        imports: [RedisModule],
        inject: ['REDIS_CLIENT'],
        throttlers: [
          {
            ttl: seconds(parseInt(process.env.THROTTLER_TTL, 10)),
            limit: parseInt(process.env.THROTTLER_LIMIT, 10),
            blockDuration: seconds(
              parseInt(process.env.THROTTLER_BLOCK_DURATION, 10),
            ),
          },
        ],
        storage: new ThrottlerStorageRedisService(redis),
      }),
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
