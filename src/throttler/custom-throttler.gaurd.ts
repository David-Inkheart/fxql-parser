import { ExecutionContext, Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const retryAfter = throttlerLimitDetail.timeToBlockExpire;

    throw new HttpException(
      {
        message: `You are being rate limited. Try again in ${retryAfter} seconds.`,
        code: 'FXQL-429',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
