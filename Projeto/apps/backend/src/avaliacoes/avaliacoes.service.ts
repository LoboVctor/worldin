import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avaliacao } from './avaliacao.entity';

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectRepository(Avaliacao)
    private avaliacoesRepository: Repository<Avaliacao>,
  ) {}

  async findByIntercambio(intercambioId: number): Promise<Avaliacao[]> {
    return this.avaliacoesRepository.find({
      where: { id_intercambio: intercambioId },
      relations: ['usuario'],
      order: { data_criacao: 'DESC' },
    });
  }

  async create(data: Partial<Avaliacao>): Promise<Avaliacao> {
    const avaliacao = this.avaliacoesRepository.create(data);
    return this.avaliacoesRepository.save(avaliacao);
  }

  async getAverageRating(intercambioId: number): Promise<number> {
    const result = await this.avaliacoesRepository
      .createQueryBuilder('a')
      .select('AVG(a.nota)', 'avg')
      .where('a.id_intercambio = :id', { id: intercambioId })
      .getRawOne();
    return result?.avg ? parseFloat(result.avg) : 0;
  }
}
