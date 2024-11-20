import { ApiBody, ApiResponse, ApiTags, ApiProperty } from '@nestjs/swagger';

export const FxqlApiTags = ApiTags('fxql-statements');

export const FxqlApiBody = ApiBody({
  description: 'Payload for parsing FXQL statements.',
  schema: {
    example: {
      FXQL: 'USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}',
    },
  },
});

export const FxqlApiResponseSuccess = ApiResponse({
  status: 200,
  description: 'Parses FXQL statements and returns results.',
  schema: {
    example: {
      message: 'Rates Parsed Successfully.',
      code: 'FXQL-200',
      data: [
        {
          EntryId: '347d4ff5-744e-474a-bed8-666d69f21d87',
          SourceCurrency: 'USD',
          DestinationCurrency: 'GBP',
          SellPrice: 200,
          BuyPrice: 100,
          CapAmount: 93800,
        },
      ],
    },
  },
});

export const FxqlApiResponseError = ApiResponse({
  status: 400,
  description: 'Invalid FXQL syntax.',
  schema: {
    example: {
      message: 'Invalid FXQL syntax in entry #1.',
      code: 'FXQL-400',
    },
  },
});

export const FxqlApiProperty = ApiProperty({
  description: 'FXQL statement to parse.',
  example: 'USD-GBP {\\n BUY 100\\n SELL 200\\n CAP 93800\\n}',
});
