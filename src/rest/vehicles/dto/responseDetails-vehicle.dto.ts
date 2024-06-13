export class ResponseVehicleDetailsDTO {
  license_plate: string;
  chassis: string;
  mark: string;
  model: string;
  year: number;
  colour: string;
  type_Vehicle: string;
  registration_document: boolean;
  insurance: boolean;
  insurance_lastDate: Date;
  purchase_Date: Date;
  dni_owner: string;
  name_owner: string;
  userFines:boolean;
}