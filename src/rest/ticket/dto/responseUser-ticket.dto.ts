import { VehicleSchema } from "../schema/vehicle.schema";

export class ResponseUserTicketDto {
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
}