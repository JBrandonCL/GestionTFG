import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min, 
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @Length(3, 100, {
    message:
      'La dirección no puede estar vacia y debe tener entre 3 y 100 caracteres',
  })
  direction?: string;
  @IsOptional()
  @Min(10000, { message: 'El codigo postal debe tener 5 caracteres' })
  @IsNumber()
  zipcode?: string;
  @IsOptional()
  @IsString()
  @Length(3, 100, {
    message:
      'La ciudad no puede estar vacia y debe tener entre 3 y 100 caracteres',
  })
  town?: string;
  @IsOptional()
  @IsString()
  username?: string;
  @IsOptional()
  @IsEmail({}, { message: 'Email debe ser válido' })
  email?: string;
  @IsOptional()
  @IsString()
  password?: string;
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}
