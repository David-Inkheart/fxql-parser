import { IsNotEmpty, IsString } from 'class-validator';

export class FxqlRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'FXQL must not be empty' })
  FXQL: string;
}
