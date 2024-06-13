import { Prop } from '@nestjs/mongoose';

export class VehicleSchema {
  @Prop({ required: true, type: String, length: 255 })
  linces_plate: string;
  @Prop({ required: true, type: String, length: 255, unique: true })
  chassis: string;
  @Prop({ required: true, type: String, length: 255 })
  mark: string;
  @Prop({ required: true, type: String, length: 255 })
  model: string;
  @Prop({ required: true, type: Number })
  year: number;
  @Prop({ required: true, type: String, length: 255 })
  colour: string;
  @Prop({ required: true, type: String, length: 255 })
  type_Vehicle: string;
  @Prop({ required: true, type: Boolean, default: false })
  registration_document: boolean;
  @Prop({ required: true, type: Boolean, default: false })
  insurance: boolean;
}
