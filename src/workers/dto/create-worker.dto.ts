import {
  IsArray,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWorkerDto {
  @IsString()
  bio!: string;

  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @IsArray()
  @IsMongoId({ each: true })
  categories!: string[];

  @IsNumber()
  @Min(0)
  experienceYears!: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birth?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsOptional()
  @IsString()
  certificate?: string;

  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentImages?: string[];
}