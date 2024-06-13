import { UsuarioSchema } from "../schema/usuario.schema";
import { VehicleSchema } from "../schema/vehicle.schema";

export class responseAdministrationDetailsTicketDto {
    direction: string;
    zipcode: string;
    police_identification: string;
    vehicle: VehicleSchema;
    reason: string;
    paid:boolean;
    createdAt: Date;
    referenceNumber: string;
    finesImport: number;
    description: string;
    usuario:UsuarioSchema;
}