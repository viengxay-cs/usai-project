   import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SigninDto {
  @IsString() @IsNotEmpty() @MaxLength(30)
  phone!: string;

  @IsString() @IsNotEmpty() @MaxLength(72)
  password!: string;
}
