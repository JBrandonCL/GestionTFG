import { IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Este campo no puede quedar vacio' })
  @MinLength(3, {
    message: 'La razon de la sancion debe contener 3 caracteres de minimo',
  })
  reason: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsString()
  @IsNotEmpty({ message: 'La matricula no puede estar vacia' })
  vehicle: string;
  @IsNumber()
  @IsOptional()
  finesImport?: number;
}
