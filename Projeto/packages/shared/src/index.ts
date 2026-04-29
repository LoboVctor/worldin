export interface UsuarioDto {
  cpf: string;
  nome: string;
  email: string;
}

export interface IntercambioDto {
  id_intercambio: number;
  titulo: string;
  pais: string;
  cidade: string;
  instituicao?: string;
  preco?: number;
  id_usuario: string; // CPF
}

export interface AvaliacaoDto {
  id_avaliacao: number;
  titulo: string;
  descricao: string;
  data_criacao: string;
  nota: number;
  id_usuario: string; // CPF
  id_intercambio: number;
}
