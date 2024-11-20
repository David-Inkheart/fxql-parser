import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FxqlService {
  validateCurrency(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
  }

  validateBuySell(value: string): boolean {
    return /^\d+(\.\d{1,5})?$/.test(value);
  }

  validateCap(value: string): boolean {
    return /^\d+$/.test(value);
  }

  parseFxql(fxql: string): any[] {
    if (!fxql || fxql.trim() === '') {
      throw new BadRequestException('FXQL input cannot be empty');
    }

    const entries = fxql.split(/\\n\\n/);
    const results = [];

    entries.forEach((entry, index) => {
      const regex =
        /([A-Z]{3})-([A-Z]{3}) \{\s*(?:\\n\s*)?BUY (\d+(\.\d{1,5})?)(?:\\n\s*)?SELL (\d+(\.\d{1,5})?)(?:\\n\s*)?CAP (\d+)(?:\\n\s*)?\}/;

      const match = entry.match(regex);

      if (!match) {
        throw new BadRequestException(
          `Invalid FXQL syntax at entry #${index + 1}`,
        );
      }

      const source = match[1];
      const destination = match[2];
      const buy = match[3];
      const sell = match[5];
      const cap = match[7];

      if (
        !this.validateCurrency(source) ||
        !this.validateCurrency(destination)
      ) {
        throw new BadRequestException(
          `Invalid currency code in entry #${index + 1}`,
        );
      }

      if (!this.validateBuySell(buy) || !this.validateBuySell(sell)) {
        throw new BadRequestException(
          `Invalid BUY or SELL value in entry #${index + 1}`,
        );
      }

      if (!this.validateCap(cap)) {
        throw new BadRequestException(
          `Invalid CAP value in entry #${index + 1}`,
        );
      }

      results.push({
        sourceCurrency: source,
        destinationCurrency: destination,
        buyPrice: parseFloat(buy),
        sellPrice: parseFloat(sell),
        capAmount: parseInt(cap, 10),
      });
    });

    return results;
  }
}
