import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Intercambio } from '../intercambios/intercambio.entity';
import { Avaliacao } from '../avaliacoes/avaliacao.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'char', length: 11 })
  cpf: string;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  senha_hash: string;

  @Column({ type: 'varchar', length: 20, default: 'ESTUDANTE' })
  role: string; // 'ESTUDANTE' ou 'GERENTE'

  @OneToMany(() => Intercambio, intercambio => intercambio.usuario)
  intercambios: Intercambio[];

  @OneToMany(() => Avaliacao, avaliacao => avaliacao.usuario)
  avaliacoes: Avaliacao[];
}
