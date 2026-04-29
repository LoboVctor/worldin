import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Intercambio } from '../intercambios/intercambio.entity';

@Entity('avaliacoes')
export class Avaliacao {
  @PrimaryGeneratedColumn()
  id_avaliacao: number;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'text' })
  descricao: string;

  @CreateDateColumn({ type: 'date' })
  data_criacao: Date;

  @Column({ type: 'int' })
  nota: number;

  @ManyToOne(() => Usuario, usuario => usuario.avaliacoes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'char', length: 11 })
  id_usuario: string;

  @ManyToOne(() => Intercambio, intercambio => intercambio.avaliacoes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_intercambio' })
  intercambio: Intercambio;

  @Column({ type: 'int' })
  id_intercambio: number;
}
