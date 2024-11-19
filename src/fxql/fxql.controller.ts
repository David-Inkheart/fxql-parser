import { Body, Controller, Post } from '@nestjs/common';
import { FxqlService } from './fxql.service';
import { PrismaService } from '../prisma/prisma.service';
import { FxqlRequestDto } from './dto/fxql-request.dto';

@Controller('fxql-statements')
export class FxqlController {
  constructor(
    private readonly fxqlService: FxqlService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async handleFxql(@Body() body: FxqlRequestDto) {
    const { FXQL } = body;

    // Parse and validate FXQL string
    const parsedEntries = this.fxqlService.parseFxql(FXQL);

    // Save entries to the database
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

      results.push(rate);
    }

    return {
      message: 'FXQL Statement Parsed Successfully.',
      code: 'FXQL-200',
      data: results,
    };
  }
}
