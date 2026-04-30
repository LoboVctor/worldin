import { Injectable, ConflictException, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private usersRepository: Repository<Usuario>,
  ) {}

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    return this.usersRepository.findOne({ where: { cpf } });
  }

  async create(user: Partial<Usuario>): Promise<Usuario> {
    const existingEmail = await this.findByEmail(user.email!);
    if (existingEmail) {
      throw new ConflictException('E-mail já está em uso.');
    }
    const existingCpf = await this.findByCpf(user.cpf!);
    if (existingCpf) {
      throw new ConflictException('CPF já está em uso.');
    }

    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async updateProfile(cpf: string, data: { nome?: string; email?: string; foto_perfil?: string }): Promise<Usuario> {
    const user = await this.findByCpf(cpf);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.findByEmail(data.email);
      if (existingEmail) {
        throw new ConflictException('E-mail já está em uso.');
      }
      user.email = data.email;
    }

    if (data.nome) {
      user.nome = data.nome;
    }

    if (data.foto_perfil !== undefined) {
      user.foto_perfil = data.foto_perfil;
    }

    return this.usersRepository.save(user);
  }

  async changePassword(cpf: string, senhaAtual: string, novaSenha: string): Promise<void> {
    const user = await this.findByCpf(cpf);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(senhaAtual, user.senha_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    // Validate new password
    this.validatePassword(novaSenha);

    const saltOrRounds = 10;
    user.senha_hash = await bcrypt.hash(novaSenha, saltOrRounds);
    await this.usersRepository.save(user);
  }

  async deleteAccount(cpf: string, senha: string): Promise<void> {
    const user = await this.findByCpf(cpf);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const isMatch = await bcrypt.compare(senha, user.senha_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    await this.usersRepository.remove(user);
  }

  validatePassword(senha: string): void {
    if (senha.length < 8 || senha.length > 50) {
      throw new BadRequestException('A senha deve ter entre 8 e 50 caracteres.');
    }
    if (!/[A-Z]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra maiúscula.');
    }
    if (!/[a-z]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos uma letra minúscula.');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(senha)) {
      throw new BadRequestException('A senha deve conter pelo menos um caractere especial.');
    }
  }
}
