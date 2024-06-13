import { Injectable } from "@nestjs/common";
import { User } from "src/rest/users/entities/user.entity";
import { ResponseUserInforDto } from "../dto/userInfo-user.dto";
import { ResponseVehicleDetailsDTO } from "src/rest/vehicles/dto/responseDetails-vehicle.dto";
import { Vehicle } from "src/rest/vehicles/entities/vehicle.entity";
import { Police } from "../entities/police.entity";
import { ResponsePoliceDto } from "../dto/response-police.dto";
import { UpdatePoliceDto } from "../dto/update-police.dto";

@Injectable()
export class PoliceMapper{
    toUserInfoResponse(user:User):ResponseUserInforDto{
        const responseUser: ResponseUserInforDto = new ResponseUserInforDto();
        responseUser.name = user.name;
        responseUser.lastname1 = user.lastname1;
        responseUser.lastname2 = user.lastname2;
        responseUser.dni = user.dni;
        responseUser.direction = user.direction;
        responseUser.zipcode = user.zipcode;
        responseUser.town = user.town;
        responseUser.hasFines = user.hasFines;
        responseUser.email = user.email;
        return responseUser;
    }
    toResponseVehicleInfoDetails(vehicle:Vehicle):ResponseVehicleDetailsDTO{
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
        response.dni_owner=vehicle.user.dni;
        response.name_owner=vehicle.user.name+" "+vehicle.user.lastname1+" "+vehicle.user.lastname2;
        response.userFines=vehicle.user.hasFines;
        return response;
      }
    toResponsePolice(police:Police):ResponsePoliceDto{
        const response= new ResponsePoliceDto();
        response.identification=police.identification;
        response.name=police.name;
        response.lastname1=police.lastname1;
        response.lastname2=police.lastname2;
        response.dni=police.dni;
        response.isDeleted=police.isDeleted;
        response.email=police.email;
        return response;
    }
    toPoliceUpdate(policeUpdate:UpdatePoliceDto,police:Police){
        if(policeUpdate.password){
            police.password=policeUpdate.password;
        }
        if(policeUpdate.username){
            police.username=policeUpdate.username;
        }
        if(policeUpdate.email){
            police.email=policeUpdate.email;
        }
        police.isDeleted = policeUpdate.isDeleted !== undefined ? policeUpdate.isDeleted : police.isDeleted;
        police.isDeleted = policeUpdate.isDeleted?policeUpdate.isDeleted:police.isDeleted;
        return police;
    }
}