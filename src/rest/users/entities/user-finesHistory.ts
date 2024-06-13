import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'FinesHistory' })
export class FinesHistory {

  /**
   * Identificación unica de la multa
   */
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;
  /**
   * Identificación del usuario que vendría siendo el dni
   */
  @Column({ type: 'varchar' })
  userId: string;
  /**
   * Identificación de la multa
   */
  @Column({ type: 'uuid' })
  fineId: string;
  /**
   * Columna que indica si la multa ha sido pagada (false) no pagada (true) pagada
   */
  @Column({ type: 'boolean', default: false })
  isPaid: boolean;
  /**
   * Fecha en la que se puso la multa
   */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  /**
   * Identificación del usuario que vendría siendo el dni
   */
  @Column({ type: 'varchar' })
  reason: string;
  /**
   * Identificación del usuario que vendría siendo el dni
   */
  @Column({ type: 'float', default: 1 })
  finesImport: number;
}