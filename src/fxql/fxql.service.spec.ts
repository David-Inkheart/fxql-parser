import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FxqlService } from './fxql.service';

describe('FxqlService', () => {
  let service: FxqlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FxqlService],
    }).compile();

    service = module.get<FxqlService>(FxqlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCurrency', () => {
    it('should return true for valid currency codes', () => {
      expect(service.validateCurrency('USD')).toBe(true);
      expect(service.validateCurrency('GBP')).toBe(true);
    });

    it('should return false for invalid currency codes', () => {
      expect(service.validateCurrency('usd')).toBe(false);
      expect(service.validateCurrency('US')).toBe(false);
      expect(service.validateCurrency('USDT')).toBe(false);
    });
  });

  describe('validateBuySell', () => {
    it('should return true for valid buy/sell values', () => {
      expect(service.validateBuySell('100')).toBe(true);
      expect(service.validateBuySell('450.43')).toBe(true);
      expect(service.validateBuySell('0.04590')).toBe(true);
    });

    it('should return false for invalid buy/sell values', () => {
      expect(service.validateBuySell('-100')).toBe(false);
      expect(service.validateBuySell('abc')).toBe(false);
      expect(service.validateBuySell('0..12039')).toBe(false);
    });
  });

  describe('validateCap', () => {
    it('should return true for valid cap values', () => {
      expect(service.validateCap('0')).toBe(true);
      expect(service.validateCap('100')).toBe(true);
    });

    it('should return false for invalid cap values', () => {
      expect(service.validateCap('-50')).toBe(false);
      expect(service.validateCap('123.45')).toBe(false);
      expect(service.validateCap('abc')).toBe(false);
    });
  });

  describe('parseSingleEntry', () => {
    it('should parse a valid FXQL entry correctly', () => {
      const fxqlEntry = 'USD-GBP {\\nBUY 100\\nSELL 200\\nCAP 93800\\n}';
      const result = service.parseSingleEntry(fxqlEntry, 0);

      expect(result).toEqual({
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 100,
        sellPrice: 200,
        capAmount: 93800,
      });
    });

    it('should throw an error for invalid currency codes', () => {
      const fxqlEntry = 'usd-GBP {\\nBUY 100\\nSELL 200\\nCAP 93800\\n}';
      expect(() => service.parseSingleEntry(fxqlEntry, 0)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid BUY value', () => {
      const fxqlEntry = 'USD-GBP {\\nBUY abc\\nSELL 200\\nCAP 93800\\n}';
      expect(() => service.parseSingleEntry(fxqlEntry, 0)).toThrow(
        BadRequestException,
      );
    });

    it('should throw an error for invalid CAP value', () => {
      const fxqlEntry = 'USD-GBP {\\nBUY 100\\nSELL 200\\nCAP -50\\n}';
      expect(() => service.parseSingleEntry(fxqlEntry, 0)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('parseFxql', () => {
    it('should parse multiple valid FXQL entries and deduplicate them', () => {
      const fxql =
        'USD-GBP {\\nBUY 100\\nSELL 200\\nCAP 93800\\n}\\n\\nUSD-GBP {\\nBUY 110\\nSELL 220\\nCAP 94800\\n}';
      const result = service.parseFxql(fxql);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 110,
        sellPrice: 220,
        capAmount: 94800,
      });
    });

    it('should throw an error for empty FXQL input', () => {
      const fxql = '';
      expect(() => service.parseFxql(fxql)).toThrow(BadRequestException);
    });

    it('should throw an error for FXQL entries exceeding the maximum limit', () => {
      const fxql = Array(1001)
        .fill('USD-GBP {\\nBUY 100\\nSELL 200\\nCAP 93800\\n}')
        .join('\\n\\n');
      expect(() => service.parseFxql(fxql)).toThrow(BadRequestException);
    });

    it('should throw an error for missing double newline separator between entries', () => {
      const fxql =
        'USD-GBP {\\nBUY 100\\nSELL 200\\nCAP 93800\\n} EUR-JPY {\\nBUY 80\\nSELL 90\\nCAP 50000\\n}';
      expect(() => service.parseFxql(fxql)).toThrow(BadRequestException);
    });
  });
});
