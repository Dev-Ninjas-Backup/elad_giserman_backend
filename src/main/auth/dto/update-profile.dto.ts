import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Express } from 'express';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'Optional name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '1234567890', description: 'Optional phone' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional profile image',
  })
  @IsOptional()
  image?: Express.Multer.File;
}
