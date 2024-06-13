import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UserRegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  name: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, {
    message: 'El apellido debe tener entre 3 y 100 caracteres',
  })
  lastname1: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, {
    message: 'El apellido debe tener entre 3 y 100 caracteres',
  })
  lastname2: string;
  @IsString()
  @IsNotEmpty()
  @Length(9, 9, { message: 'El dni debe tener entre 9 caracteres ' })
  dni: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, {
    message:
      'La dirección no puede estar vacia y debe tener entre 3 y 100 caracteres',
  })
  direction: string;
  @Min(10000, { message: 'El codigo postal debe tener 5 caracteres' })
  @IsNumber()
  @IsNotEmpty()
  zipcode: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100, {
    message:
      'La ciudad no puede estar vacia y debe tener entre 3 y 100 caracteres',
  })
  town: string;
  //Campos para el login
  @IsString()
  @IsNotEmpty({ message: 'Username no puede estar vacío' })
  username: string;
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email no puede estar vacío' })
  email: string;
  @IsString()
  @IsNotEmpty({ message: 'Password no puede estar vacío' })
  password: string;
}
