import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(data: any) {
    // Validate password
    this.usersService.validatePassword(data.senha);

    if (!data.role || !['ESTUDANTE', 'GERENTE'].includes(data.role)) {
      throw new BadRequestException('Selecione um tipo de conta válido (ESTUDANTE ou GERENTE).');
    }

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(data.senha, saltOrRounds);

    const user = await this.usersService.create({
      nome: data.nome,
      cpf: data.cpf,
      email: data.email,
      senha_hash: hashedPassword,
      role: data.role,
    });

    // Remove password hash from response
    const { senha_hash, ...result } = user;
    return result;
  }

  async login(data: any) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const isMatch = await bcrypt.compare(data.senha, user.senha_hash);
    if (!isMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = { email: user.email, sub: user.cpf, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        cpf: user.cpf,
        nome: user.nome,
        email: user.email,
        role: user.role,
        foto_perfil: user.foto_perfil,
      }
    };
  }
}
