import { Controller, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch(':cpf/profile')
  async updateProfile(@Param('cpf') cpf: string, @Body() body: { nome?: string; email?: string }) {
    const user = await this.usersService.updateProfile(cpf, body);
    const { senha_hash, ...result } = user;
    return result;
  }

  @Patch(':cpf/password')
  async changePassword(@Param('cpf') cpf: string, @Body() body: { senhaAtual: string; novaSenha: string }) {
    await this.usersService.changePassword(cpf, body.senhaAtual, body.novaSenha);
    return { message: 'Senha alterada com sucesso.' };
  }

  @Delete(':cpf')
  async deleteAccount(@Param('cpf') cpf: string, @Body() body: { senha: string }) {
    await this.usersService.deleteAccount(cpf, body.senha);
    return { message: 'Conta excluída com sucesso.' };
  }
}
