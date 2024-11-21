import { Test, TestingModule } from '@nestjs/testing';
import { FxqlController } from './fxql.controller';
import { FxqlService } from './fxql.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FxqlController', () => {
  let controller: FxqlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxqlController],
      providers: [FxqlService, PrismaService],
    }).compile();

    controller = module.get<FxqlController>(FxqlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return payload with rates in expected format when successful', async () => {
    const body = {
      FXQL: 'USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}',
    };
    const result = await controller.handleFxql(body);

    expect(result.data).toBeInstanceOf(Array);
    if (result.data.length === 1) {
      expect(result.message).toBe('Rates Parsed Successfully.');
    } else {
      expect(result.message).toBe('FXQL Statement Parsed Successfully.');
    }
    expect(result.code).toBe('FXQL-200');
    expect(result.data[0]).toEqual({
      EntryId: expect.any(String),
      SourceCurrency: 'USD',
      DestinationCurrency: 'GBP',
      SellPrice: 200,
      BuyPrice: 100,
      CapAmount: 93800,
    });
  });
});
