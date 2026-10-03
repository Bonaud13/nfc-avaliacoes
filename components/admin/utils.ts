export const brl = (value: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

export const shortDate = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
};

export const dateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export const statusLabel: Record<string, string> = {
  estoque: "Em estoque",
  reservada: "Reservada",
  vendida: "Vendida",
  instalada: "Instalada",
  manutencao: "Manutenção",
  inativa: "Inativa",
  orcamento: "Orçamento",
  pendente: "Pendente",
  parcial: "Parcial",
  pago: "Pago",
  cancelado: "Cancelado",
  atrasado: "Atrasado",
};

export const paymentMethods = [
  "Pix",
  "Dinheiro",
  "Cartão de débito",
  "Cartão de crédito",
  "Transferência",
  "Boleto",
  "Outro",
];
