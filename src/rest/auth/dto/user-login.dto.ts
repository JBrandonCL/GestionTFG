import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO que admite tanto usuario como correo electrónico para el inicio de sesión.
 * Pero siempre es obligatorio el campo de contraseña.
 */
export class UserLoginDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Username no puede estar vacío' })
  username?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Email no puede estar vacío' })
  email?: string;

  @IsString({ message: 'Password no es válido' })
  @IsNotEmpty({ message: 'Password no puede estar vacío' })
  password: string;
}
