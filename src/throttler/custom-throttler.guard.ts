import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    try {
      const retryAfter = throttlerLimitDetail.timeToBlockExpire || 0;
      throw new HttpException(
        {
          message: `You are being rate limited. Try again in ${retryAfter} seconds.`,
          code: 'FXQL-429',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } catch (error) {
      if (error.name === 'ReplyError') {
        throw new HttpException(
          {
            message:
              'Rate-limiting configuration error. Please contact support.',
            code: 'FXQL-500',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw error;
    }
  }
}
