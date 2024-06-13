import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Este campo no puede quedar vacio' })
  @MinLength(3, {
    message: 'La razon de la sancion debe contener 3 caracteres de minimo',
  })
  reason?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsString()
  @MinLength(7,{ message: 'La matricula debe contener 7 caracteres de minimo' })
  @IsNotEmpty({ message: 'La matricula no puede estar vacia' })
  vehicle?: string;
  @IsOptional()
  @IsBoolean()
  deleteTicker?: boolean;
  @IsOptional()
  @IsNumber()
  finesImport?: number;
}
