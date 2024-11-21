import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { PrismaService } from '../prisma/prisma.service';
import { FxqlRequestDto } from './dto/fxql-request.dto';
import { ResponseUtil } from '../utils/response.utils';
import {
  FxqlApiTags,
  FxqlApiBody,
  FxqlApiResponseSuccess,
  FxqlApiResponseError,
} from './fxql.swagger';

@FxqlApiTags
@Controller('fxql-statements')
export class FxqlController {
  constructor(
    private readonly fxqlService: FxqlService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @FxqlApiBody
  @FxqlApiResponseSuccess
  @FxqlApiResponseError
  async handleFxql(@Body() body: FxqlRequestDto) {
    const { FXQL } = body;

    try {
      const parsedEntries = this.fxqlService.parseFxql(FXQL);

      const results = [];
      for (const entry of parsedEntries) {
        let rate = await this.prisma.exchangeRate.findFirst({
          where: {
            sourceCurrency: entry.sourceCurrency,
            destinationCurrency: entry.destinationCurrency,
          },
        });

        if (rate) {
          rate = await this.prisma.exchangeRate.update({
            where: { id: rate.id },
            data: entry,
          });
        } else {
          rate = await this.prisma.exchangeRate.create({ data: entry });
        }

        results.push({
          EntryId: rate.id,
          SourceCurrency: rate.sourceCurrency,
          DestinationCurrency: rate.destinationCurrency,
          SellPrice: rate.sellPrice.toNumber(),
          BuyPrice: rate.buyPrice.toNumber(),
          CapAmount: rate.capAmount,
        });
      }

      const message =
        results.length > 1
          ? 'FXQL Statement Parsed Successfully.'
          : 'Rates Parsed Successfully.';

      return ResponseUtil.success(message, 'FXQL-200', results);
    } catch (error) {
      const statusCode = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        ResponseUtil.error(error.message, statusCode),
        statusCode,
      );
    }
  }
}
