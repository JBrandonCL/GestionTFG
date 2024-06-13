import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
@Entity({ name: 'vehicles' })
export class Vehicle {
  /**
   * Numero de Identificacion del vehiculo
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;
  /**
   * Matricula del vehiculo
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  linces_plate: string;
  /**
   * Chasis del vehiculo unico , no existen dos vehiculos con el mismo chasis
   * En caso de que exista un vehiculo con el mismo chasis, se considera un vehiculo clonado o falsificado
   */
  @Column({ type: 'varchar', nullable: false, unique: true })
  chassis: string;
  /**
   * Marca del vehiculo
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  mark: string;
  /**
   * Modelo del vehiculo
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  model: string;
  /**
   * Año de fabricacion del vehiculo
   */
  @Column({ type: 'integer', nullable: false, unique: false })
  year: number;
  /**
   * Color del vehiculo
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  colour: string;
  /**
   * Tipo de vehiculo
   */
  @Column({ type: 'varchar', nullable: false, unique: false })
  type_Vehicle: string;
  /**
   * Permiso de circulacion boolean
   */
  @Column({ type: 'boolean', default: false, nullable: false })
  registration_document: boolean;
  /**
   * Seguro del vehiculo boolean
   * Si no tiene seguro, no puede circular ademas de que es una falta grave
   */
  @Column({ type: 'boolean', default: false, nullable: false })
  insurance: boolean;
  /**
   * Fecha de fin del seguro
   */
  @UpdateDateColumn({
    type: 'timestamp',
  })
  insurance_lastDate: Date;
  /**
   * Fecha de cambio del vehiculo
   */
  @UpdateDateColumn({
    type: 'timestamp',
    default: null,
    nullable: true,
  })
  ownerChangeDate: Date;
  /**
   * Si el vehiculo ya es catelogado como vehiculo de segunda mano
   */
  @Column({ type: 'boolean', nullable: true, default: false })
  ownerChange: boolean;
  /**
   * Fecha en la que empezo a ciruclar el vehiculo
   * Coincide con la fecha de compra del vehiculo
   */
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  purchase_Date: Date;
  /**
   * Indicador si el vehiculo a sido dado de baja
   */
  @Column({ type: 'boolean', nullable: true, default: true })
  active: boolean;
  /**
   * Usuario al que pertenece el vehiculo
   */
  @ManyToOne(() => User, (user) => user.vehicles, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
