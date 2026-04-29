import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Intercambio } from './intercambio.entity';

@Injectable()
export class IntercambiosService {
  constructor(
    @InjectRepository(Intercambio)
    private intercambiosRepository: Repository<Intercambio>,
  ) {}

  async findAll(): Promise<Intercambio[]> {
    return this.intercambiosRepository.find({
      relations: ['avaliacoes'],
    });
  }

  async findById(id: number): Promise<Intercambio> {
    const intercambio = await this.intercambiosRepository.findOne({
      where: { id_intercambio: id },
      relations: ['avaliacoes', 'avaliacoes.usuario'],
    });
    if (!intercambio) {
      throw new NotFoundException('Intercâmbio não encontrado.');
    }
    return intercambio;
  }

  async create(data: Partial<Intercambio>): Promise<Intercambio> {
    const intercambio = this.intercambiosRepository.create(data);
    return this.intercambiosRepository.save(intercambio);
  }

  async update(id: number, data: Partial<Intercambio>): Promise<Intercambio> {
    const intercambio = await this.findById(id);
    Object.assign(intercambio, data);
    return this.intercambiosRepository.save(intercambio);
  }

  async delete(id: number): Promise<void> {
    const intercambio = await this.findById(id);
    await this.intercambiosRepository.remove(intercambio);
  }
}
