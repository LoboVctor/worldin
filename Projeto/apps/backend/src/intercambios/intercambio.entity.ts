import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from '../users/user.entity';
import { Avaliacao } from '../avaliacoes/avaliacao.entity';

@Entity('intercambios')
export class Intercambio {
  @PrimaryGeneratedColumn()
  id_intercambio: number;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'varchar', length: 80 })
  pais: string;

  @Column({ type: 'varchar', length: 80 })
  cidade: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  instituicao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  preco: number;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  link_compra: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @ManyToOne(() => Usuario, usuario => usuario.intercambios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'char', length: 11 })
  id_usuario: string;

  @OneToMany(() => Avaliacao, avaliacao => avaliacao.intercambio)
  avaliacoes: Avaliacao[];

  @Column({ type: 'varchar', length: 1000, nullable: true })
  imagem: string;
}
