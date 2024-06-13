import { User } from '../../users/entities/user.entity';
import { UsuarioSchema } from '../schema/usuario.schema';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { VehicleSchema } from '../schema/vehicle.schema';
import { PoliceSchema } from '../schema/police.schema';
import { Ticket } from '../schema/ticket';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { CreateFinesDto } from 'src/rest/users/dto/create-fines.dto';
import { TicketService } from '../ticket.service';
import { ResponseUserTicketDto } from '../dto/responseUser-ticket.dto';
import { Police } from 'src/rest/police/entities/police.entity';
import { ResponseAdministrationTicketDto } from '../dto/responseAdministration-ticket.dto';
import { responseAdministrationDetailsTicketDto } from '../dto/responseTicketDetailsAdministation-ticket.dto';
import { ResponseMinTicketDto } from '../dto/response-min-ticket.dto';

export class TicketMapper {
  /**
   * Recibe un usuario y lo convierte a un esquema de usuario para mongo
   * @param createUser Usuario a convertir
   * @returns UsuarioSchema
   */
  toUserSchema(createUser: User): UsuarioSchema {
    const user = new UsuarioSchema();
    user.dni = createUser.dni;
    user.name = createUser.name;
    user.lastname1 = createUser.lastname1;
    user.lastname2 = createUser.lastname2;
    user.email = createUser.email;
    user.direction = createUser.direction;
    user.zipcode = createUser.zipcode;
    user.town = createUser.town;
    return user;
  }
  toVehicleSchema(createVehicle: Vehicle): VehicleSchema {
    const vehicle = new VehicleSchema();
    vehicle.linces_plate = createVehicle.linces_plate;
    vehicle.chassis = createVehicle.chassis;
    vehicle.mark = createVehicle.mark;
    vehicle.model = createVehicle.model;
    vehicle.year = createVehicle.year;
    vehicle.colour = createVehicle.colour;
    vehicle.type_Vehicle = createVehicle.type_Vehicle;
    vehicle.registration_document = createVehicle.registration_document;
    vehicle.insurance = createVehicle.insurance;
    return vehicle;
  }
  toPoliceSchema(police:Police): PoliceSchema {
    const policeSchema = new PoliceSchema();
    policeSchema.name = police.name;
    policeSchema.lastname1 = police.lastname1;
    policeSchema.lastname2 = police.lastname2;
    policeSchema.identification = police.identification;
    return policeSchema;
  }
  toEntitySchema(
    vehicle: VehicleSchema,
    usuario: UsuarioSchema,
    police: PoliceSchema,
    createTicket: CreateTicketDto,
  ) {
    const ticket = new Ticket();
    ticket.vehicle = vehicle;
    ticket.usuario = usuario;
    ticket.police = police;
    ticket.reason = createTicket.reason; 
    ticket.description = createTicket.description?createTicket.description:"";
    ticket.finesImport = createTicket.finesImport;
    return ticket;
  }
  toFines(ticket:Ticket):CreateFinesDto{
    const fines = new CreateFinesDto();
    fines.userId = ticket.usuario.dni;
    fines.fineId = ticket.referenceNumber;
    fines.reason =ticket.reason;
    fines.finesImport = ticket.finesImport;
    return fines;
  }
  toResponseUserTicketDto(ticket:Ticket){
    const response = new ResponseUserTicketDto();
    response.direction = ticket.usuario.direction;
    response.zipcode = ticket.usuario.zipcode;
    response.police_identification = ticket.police.identification;
    response.vehicle = ticket.vehicle;
    response.reason = ticket.reason;
    response.paid = ticket.paid;
    response.createdAt = ticket.createdAt;
    response.referenceNumber = ticket.referenceNumber;
    response.finesImport = ticket.finesImport;
    response.description = ticket.description;
    return response;
  }
  toResponseAdministrationTicketDto(ticket:Ticket){
    const response = new ResponseAdministrationTicketDto();
    response.userId = ticket.usuario.dni;
    response.fineId = ticket.referenceNumber;
    response.isPaid = ticket.paid;
    response.createdAt = ticket.createdAt;
    response.reason = ticket.reason;
    response.finesImport = ticket.finesImport;
    response.limitModTime=ticket.limitModTime;
    response.linces_plate=ticket.vehicle.linces_plate;
    response.police_identification = ticket.police.identification;
    return response;
  }
  toResponseAdministrationDetailsTicketDto(ticket:Ticket){
    const response = new responseAdministrationDetailsTicketDto();
    response.direction = ticket.usuario.direction;
    response.zipcode = ticket.usuario.zipcode;
    response.police_identification = ticket.police.identification;
    response.vehicle = ticket.vehicle;
    response.reason = ticket.reason;
    response.paid = ticket.paid;
    response.createdAt = ticket.createdAt;
    response.referenceNumber = ticket.referenceNumber;
    response.finesImport = ticket.finesImport;
    response.description = ticket.description;
    response.usuario = ticket.usuario;
    return response;
  }
  toResponseAdministrationTicketDto2(ticket:any){
    const response = new ResponseAdministrationTicketDto();
    response.userId = ticket.usuario.dni;
    response.fineId = ticket.referenceNumber;
    response.isPaid = ticket.paid;
    response.createdAt = ticket.createdAt;
    response.reason = ticket.reason;
    response.finesImport = ticket.finesImport;
    response.limitModTime=ticket.limitModTime;
    response.linces_plate=ticket.vehicle.linces_plate;
    return response;
  }
  toDetailsTicket(ticket:Ticket){
    const response= new ResponseMinTicketDto();
    response.reason = ticket.reason;
    response.description = ticket.description;
    response.vehicle = ticket.vehicle.linces_plate;
    response.finesImport = ticket.finesImport;
    return response;
  }
}
