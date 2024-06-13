import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinesHistory } from './entities/user-finesHistory';
import { CreateFinesDto } from './dto/create-fines.dto';
import { FilterOperator, FilterSuffix, PaginateQuery, paginate } from 'nestjs-paginate';

@Injectable()
export class FinesService {
  private readonly logger = new Logger(FinesService.name);
  constructor(
    @InjectRepository(FinesHistory)
    private finesRepository: Repository<FinesHistory>,
  ) {}
  /**
   *  Metodo que se encarga de crear un registro de multa en la base de datos
   * @param fine  datos de la multa a crear
   * @returns  el registro de la multa creado
   * @throws Error si no se pudo crear la multa
   */
  async create(fine: CreateFinesDto): Promise<FinesHistory> {
    this.logger.log(
      `Creating fine with the next data: ${JSON.stringify(fine)}`,
    );
    const fines = new FinesHistory();
    fines.userId = fine.userId;
    fines.fineId = fine.fineId;
    fines.reason = fine.reason;
    fines.finesImport = fine.finesImport;
    return await this.finesRepository.save(fines);
  }
  /**
   *  Metodo que se encarga de pagar una multa
   * @param fineId   identificador de la multa a pagar
   * @returns  el registro de la multa pagada
   * @throws NotFoundException si la multa no existe
   */
  async payFine(fineId: string): Promise<FinesHistory> {
    this.logger.log(`Paying fine with the next data: ${fineId}`);
    const fine = await this.finesRepository.findOne({
      where: { fineId: fineId },
    });
    if (!fine) {
      this.logger.error(`The fine with id ${fineId} does not exist`);
      throw new NotFoundException(`La multa con id ${fineId} no existe`);
    }
    fine.isPaid = true;
    return await this.finesRepository.save(fine);
  }
  /**
   *  Metodo que se encarga de buscar todas las multas de un usuario
   * @param userId Dni del usuario
   * @returns  todas las multas del usuario
   */
  async findAllByUser(userId: string): Promise<FinesHistory[]> {
    this.logger.log(`Finding all fines of user with id: ${userId}`);
    var exist= await this.finesRepository.find({ where: { userId: userId },order:{createdAt:'DESC'} });
    if(!exist){
      return null;
    }
    else{
      return exist
    }
  }
  /**
   *  Metodo que se encarga de buscar todas las multas de un Usuario
   * @param query  Query para la paginacion de las multas
   * @returns  todas las multas del policia
   */
  async findAllByAgent(dni:string,query: PaginateQuery) {
    const queryBuilder = this.finesRepository
      .createQueryBuilder('FinesHistory')
      .where('FinesHistory.userId = :dni', { dni });
      
    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['isPaid'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['isPaid'],
      filterableColumns: {
        isPaid: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    });

    const res = {
      data: pagination.data,
      meta: pagination.meta,
      links: pagination.links,
    };
    return res;
  }
  async updatefine(fineId: string, fine: CreateFinesDto): Promise<FinesHistory> {
    this.logger.log(`Updating fine with the next data: %s${JSON.stringify(fine)}`);
    const fineToUpdate = await this.finesRepository.findOne({
      where: { fineId: fineId },
    });
    if (!fineToUpdate) {
      this.logger.error(`The fine with id ${fineId} does not exist`);
      throw new NotFoundException(`La multa con id ${fineId} no existe`);
    }
    fineToUpdate.userId = fine.userId;
    fineToUpdate.reason = fine.reason;
    fineToUpdate.finesImport = fine.finesImport;
    return await this.finesRepository.save(fineToUpdate);
  }
  async deltefine(fineId: string): Promise<FinesHistory> {
    this.logger.log(`Deleting fine with the next data: ${fineId}`);
    const fine = await this.finesRepository.findOne({
      where: { fineId: fineId },
    });
    if (!fine) {
      this.logger.error(`The fine with id ${fineId} does not exist`);
      throw new NotFoundException(`La multa con id ${fineId} no existe`);
    }
    return await this.finesRepository.remove(fine);
  }
}
