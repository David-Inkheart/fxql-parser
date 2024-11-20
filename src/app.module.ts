import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { FxqlModule } from './fxql/fxql.module';
import { PrismaModule } from './prisma/prisma.module';
import { CustomThrottlerGuard } from './throttler/custom-throttler.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, 'REDIS_CLIENT'],
      useFactory: (configService: ConfigService, redis: Redis) => ({
        throttlers: [
          {
            ttl: seconds(configService.get<number>('THROTTLER_TTL')),
            limit: configService.get<number>('THROTTLER_LIMIT'),
            blockDuration: seconds(
              configService.get<number>('THROTTLER_BLOCK_DURATION'),
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
