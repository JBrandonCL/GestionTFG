import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { plainToClass } from 'class-transformer';
import { ResponseVehicleDto } from '../dto/response-vehicle.dto';
import { ResponseVehicleDetailsDTO } from '../dto/responseDetails-vehicle.dto';

export class VehicleMapper {
  toEntity(createVehiculoDto: CreateVehicleDto, user: User): Vehicle {
    const vehicle = plainToClass(Vehicle, createVehiculoDto);
    vehicle.user = user;
    vehicle.ownerChange = false;
    return vehicle;
  }
  toResponse(vehicle:Vehicle):ResponseVehicleDto{
    const response= new ResponseVehicleDto();
    response.colour=vehicle.colour;
    response.linces_plate=vehicle.linces_plate;
    response.mark=vehicle.mark;
    response.model=vehicle.model;
    response.year=vehicle.year;
    response.type_Vehicle=vehicle.type_Vehicle;
    return response;
  }
  toResponseDetails(vehicle:Vehicle):ResponseVehicleDetailsDTO{
    const response= new ResponseVehicleDetailsDTO();
    response.license_plate=vehicle.linces_plate;
    response.chassis=vehicle.chassis;
    response.mark=vehicle.mark;
    response.model=vehicle.model;
    response.year=vehicle.year;
    response.colour=vehicle.colour;
    response.type_Vehicle=vehicle.type_Vehicle;
    response.registration_document=vehicle.registration_document;
    response.insurance=vehicle.insurance;
    response.insurance_lastDate=vehicle.insurance_lastDate;
    response.purchase_Date=vehicle.purchase_Date;
    return response;
  }
}
