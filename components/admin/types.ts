export type Plate = {
  id: number;
  codigo: string;
  nome_empresa: string;
  nome_placa: string | null;
  link_google: string;
  ativa: boolean;
  criada_em: string;
};

export type PlateAdmin = {
  id: string;
  placa_id: number;
  cliente_id: string | null;
  status: "estoque" | "reservada" | "vendida" | "instalada" | "manutencao" | "inativa";
  data_compra: string | null;
  custo_compra: number;
  data_venda: string | null;
  preco_venda: number;
  data_instalacao: string | null;
  local_instalacao: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  contato_email: string | null;
  forma_pagamento: string | null;
  parcelas: number;
  observacoes: string | null;
};

export type Client = {
  id: string;
  nome: string;
  empresa: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  documento: string | null;
  endereco: string | null;
  observacoes: string | null;
  criado_em: string;
};

export type Sale = {
  id: string;
  cliente_id: string | null;
  data_venda: string;
  subtotal: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: string | null;
  status: "orcamento" | "pendente" | "parcial" | "pago" | "cancelado";
  observacoes: string | null;
  criado_em: string;
};

export type Expense = {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  forma_pagamento: string | null;
  recorrente: boolean;
  observacoes: string | null;
};

export type Payment = {
  id: string;
  venda_id: string | null;
  cliente_id: string | null;
  descricao: string | null;
  valor: number;
  forma_pagamento: string | null;
  status: "pendente" | "pago" | "atrasado" | "cancelado";
  vencimento: string | null;
  pago_em: string | null;
};

export type Access = {
  id: number;
  placa_id: number;
  acessado_em: string;
};

export type AdminData = {
  plates: Plate[];
  plateAdmin: PlateAdmin[];
  clients: Client[];
  sales: Sale[];
  expenses: Expense[];
  payments: Payment[];
  accesses: Access[];
};
