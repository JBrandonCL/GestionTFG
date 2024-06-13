import { PartialType } from '@nestjs/mapped-types';
import { CreatePoliceDto } from './create-police.dto';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdatePoliceDto extends PartialType(CreatePoliceDto) {
    @IsOptional()
    @IsString()
    password?: string;
    @IsOptional()
    @IsString()
    username?: string;
    @IsOptional()
    @IsEmail()
    email?: string;
    @IsOptional()
    @IsBoolean()
    isDeleted?: boolean;
}
