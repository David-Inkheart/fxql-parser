import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class SomeService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async getValue(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async setValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }
}
