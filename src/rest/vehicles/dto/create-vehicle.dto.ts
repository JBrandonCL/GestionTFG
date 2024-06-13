import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @Length(7, 7, { message: 'La matricula debe tener 7 caracteres' })
  linces_plate: string;
  @IsString()
  @IsNotEmpty()
  @Length(17, 17, { message: 'El chasis debe constar de 17 caracteres' })
  chassis: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'La marca debe tener entre 3 y 100 caracteres' })
  mark: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'El modelo debe tener entre 3 y 100 caracteres' })
  model: string;
  @IsNumber()
  @Min(1900, { message: 'El año debe ser mayor a 1900' })
  @IsNotEmpty()
  year: number;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'El color debe tener entre 3 y 100 caracteres' })
  colour: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, {
    message: 'El tipo de vehiculo debe tener entre 3 y 100 caracteres',
  })
  type_Vehicle: string;
  @IsBoolean()
  @IsNotEmpty()
  registration_document: boolean;
  @IsBoolean()
  @IsNotEmpty()
  insurance: boolean;
  @IsString()
  @IsNotEmpty()
  @Length(9, 9, { message: 'El dni debe tener entre 9 caracteres ' })
  dniOwner: string;
}
