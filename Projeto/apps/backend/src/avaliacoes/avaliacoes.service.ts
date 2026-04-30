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

  async findById(id: number): Promise<Avaliacao> {
    const avaliacao = await this.avaliacoesRepository.findOne({ where: { id_avaliacao: id }, relations: ['usuario'] });
    if (!avaliacao) {
      throw new NotFoundException('Avaliação não encontrada.');
    }
    return avaliacao;
  }

  async remove(id: number): Promise<void> {
    const result = await this.avaliacoesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Avaliação não encontrada.');
    }
  }
}
