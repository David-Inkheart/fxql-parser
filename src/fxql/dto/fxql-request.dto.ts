import { IsNotEmpty, IsString } from 'class-validator';
import { FxqlApiProperty } from '../fxql.swagger';
export class FxqlRequestDto {
  @FxqlApiProperty
  @IsString()
  @IsNotEmpty({ message: 'FXQL must not be empty' })
  FXQL: string;
}
