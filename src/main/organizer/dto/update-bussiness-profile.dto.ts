import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBusinessProfileDto {
  @ApiProperty({ example: 'The Coffee Spot (Updated)', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Cozy cafe with a new outdoor section',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'Update you phone numsebr',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Gulshan, Dhaka', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiProperty({ example: '09:00 AM', required: false })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiProperty({ example: '11:00 PM', required: false })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiProperty({
    example: 'uuid-of-file-instance',
    description: 'ID of the main image to display first',
    required: false,
  })
  @IsOptional()
  @IsString()
  mainImageId?: string;

  @ApiProperty({
    example: {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '10:00', close: '18:00', isOpen: true },
      sunday: { open: '00:00', close: '00:00', isOpen: false },
    },
    description: 'Business hours per day of the week',
    required: false,
  })
  @IsOptional()
  @IsObject()
  businessHours?: Record<
    string,
    { open: string; close: string; isOpen: boolean }
  >;

  @ApiProperty({
    description: 'Existing gallery images coming from client',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  existingImages?: string;

  @ApiProperty({
    type: 'string',
    example: 'Restaurant',
    required: false,
  })
  @IsOptional()
  @IsString()
  profileTypeName?: string;

  @ApiProperty({
    example: 'categoryId123',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    example: 'BAR',
    required: false,
  })
  @IsOptional()
  @IsString()
  categoryName?: string;

  // ⭐ SOCIAL LINKS — fixed and added properly

  @ApiProperty({
    example: 'https://facebook.com/thecoffeeshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({
    example: 'https://instagram.com/thecoffeeshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({
    example: 'https://twitter.com/thecoffeeshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiProperty({
    example: 'https://thecoffeeshop.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({
    example: 'https://linkedin.com/company/thecoffeeshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiProperty({
    example: 'https://pinterest.com/thecoffeeshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  pinterest?: string;

  @ApiProperty({
    example: 'https://youtube.com/thecoffeeshop',
    required: false,
  })
  @IsOptional()
  @IsString()
  youtube?: string;
}
