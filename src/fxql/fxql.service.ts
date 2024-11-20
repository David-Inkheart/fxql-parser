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
    return /^\d+$/.test(value) && parseInt(value, 10) >= 0;
  }

  parseSingleEntry(entry: string, index: number): any {
    const lines = entry.trim().split(/\\n\s*/);

    const header = lines[0]?.trim();
    const headerRegex = /^([A-Z]{3})-([A-Z]{3}) \{$/;
    const headerMatch = header.match(headerRegex);

    if (!headerMatch) {
      if (!header.includes(' ')) {
        throw new BadRequestException(
          `Invalid FXQL syntax in entry #${index + 1}: '${header}'. A single space is required between the currency pair and the opening brace '{'.`,
        );
      }

      throw new BadRequestException(
        `Invalid currency code in entry #${index + 1}: '${header}'. Currency codes must be exactly 3 uppercase letters and formatted as 'CURR1-CURR2 {'.`,
      );
    }

    const source = headerMatch[1];
    const destination = headerMatch[2];

    if (!this.validateCurrency(source) || !this.validateCurrency(destination)) {
      throw new BadRequestException(
        `Invalid currency code in entry #${index + 1}: '${source}-${destination}'. Currency codes must be exactly 3 uppercase letters.`,
      );
    }

    const buyLine = lines[1]?.trim();
    const sellLine = lines[2]?.trim();
    const capLine = lines[3]?.trim();

    const buyRegex = /^BUY (\d+(\.\d{1,5})?)$/;
    const sellRegex = /^SELL (\d+(\.\d{1,5})?)$/;
    const capRegex = /^CAP (\d+)$/;

    if (!buyLine || !buyLine.match(buyRegex)) {
      throw new BadRequestException(
        `Invalid BUY value in entry #${index + 1}: '${buyLine}'. Must follow the format 'BUY X' where X is a numeric value with up to 5 decimal places.`,
      );
    }

    if (!sellLine || !sellLine.match(sellRegex)) {
      throw new BadRequestException(
        `Invalid SELL value in entry #${index + 1}: '${sellLine}'. Must follow the format 'SELL X' where X is a numeric value with up to 5 decimal places.`,
      );
    }

    const capMatch = capLine?.match(capRegex);
    if (!capMatch || !this.validateCap(capMatch[1])) {
      throw new BadRequestException(
        `Invalid CAP value in entry #${index + 1}: '${capLine}'. Must follow the format 'CAP X' where X is a non-negative whole number.`,
      );
    }

    const buy = parseFloat(buyLine.match(buyRegex)[1]);
    const sell = parseFloat(sellLine.match(sellRegex)[1]);
    const cap = parseInt(capMatch[1], 10);

    return {
      sourceCurrency: source,
      destinationCurrency: destination,
      buyPrice: buy,
      sellPrice: sell,
      capAmount: cap,
    };
  }

  parseFxql(fxql: string): any[] {
    if (!fxql || fxql.trim() === '') {
      throw new BadRequestException(
        'Syntax for FXQL statement is: CURR1-CURR {\\nBUY X\\nSELL Y\\nCAP Z\\n} where CURR1 and CURR2 are 3-letter currency codes, X and Y are numeric values with up to 5 decimal places, and Z is a non-negative whole number.',
      );
    }

    const segments = fxql
      .trim()
      .split(/\\n\\n/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length > 1000) {
      throw new BadRequestException(
        'Maximum number of currency pairs exceeded. A maximum of 1000 currency pairs are allowed per request.',
      );
    }

    const entries = [];

    const reassembledPayload = segments.join('\\n\\n');

    segments.forEach((entry, index) => {
      const regex =
        /([A-Z]{3})-([A-Z]{3}) \{\s*(?:\\n\s*)?BUY (\d+(\.\d{1,5})?)(?:\\n\s*)?SELL (\d+(\.\d{1,5})?)(?:\\n\s*)?CAP (\d+)(?:\\n\s*)?\}/;

      const match = entry.match(regex);

      const buyCount = (entry.match(/BUY/g) || []).length;
      const sellCount = (entry.match(/SELL/g) || []).length;
      const capCount = (entry.match(/CAP/g) || []).length;
      const headerCount = (entry.match(/([A-Z]{3})-([A-Z]{3})/g) || []).length;

      if (
        !(
          buyCount === 1 ||
          sellCount === 1 ||
          capCount === 1 ||
          headerCount === 1
        )
      ) {
        // If there is any content left after removing the matched entry, or if there is no match
        if (!match || entry.replace(match[0], '').trim() !== '') {
          throw new BadRequestException(
            `Invalid FXQL syntax statement in entry #${index + 1}: multiple entries must be separated by double newlines '\\n\\n'. Example: 'CURR1-CURR2 {\\nBUY X\\nSELL Y\\nCAP Z\\n}\\n\\nCURR1-CURR2 {\\nBUY X\\nSELL Y\\nCAP Z\\n}'`,
          );
        }
      }
    });

    if (reassembledPayload !== fxql.trim() || segments.length === 0) {
      throw new BadRequestException(
        `Invalid FXQL syntax statement. Must follow the format 'CURR1-CURR2 {\\nBUY X\\nSELL Y\\nCAP Z\\n}' and multiple entries must be separated by double newlines '\\n\\n'.`,
      );
    }

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];

      try {
        const parsedEntry = this.parseSingleEntry(segment, entries.length);
        entries.push(parsedEntry);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new BadRequestException(
            `Invalid FXQL syntax in entry #${entries.length + 1}: ${error.message}`,
          );
        }
        throw error;
      }
    }

    return entries;
  }
}
