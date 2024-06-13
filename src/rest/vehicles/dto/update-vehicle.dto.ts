import { PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  @IsOptional()
  @IsString()
  @Length(3, 999, {
    message: 'El color no puede contener menos de 3 caracteres',
  })
  colour?: string;
  //Si no tiene seguro es multable
  @IsOptional()
  @IsBoolean()
  insecurance?: boolean;
  //Si no tiene permiso de circulacion es multable
  @IsOptional()
  @IsBoolean()
  registration_document?: boolean;
  //Si no esta activo es multable
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
