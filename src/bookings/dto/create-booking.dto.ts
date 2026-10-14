import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty() @IsMongoId() workerId!: string;
  @IsNotEmpty() @IsMongoId() categoryId!: string;
  @IsNotEmpty() @IsString() description!: string;
  @IsNotEmpty() @IsDateString() scheduledDate!: string;
  @IsNotEmpty() @IsNumber() @Min(-90) @Max(90) latitude!: number;
  @IsNotEmpty() @IsNumber() @Min(-180) @Max(180) longitude!: number;
  @IsOptional() @IsNumber() @Min(0) priceEstimate?: number;
}
