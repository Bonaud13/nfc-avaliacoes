# PPRT.IA — Sistema de Avaliações via NFC

Sistema web desenvolvido pela **PPRT.IA** para gerenciamento de placas NFC voltadas à facilitação de avaliações no Google.

O projeto combina uma landing page comercial, redirecionamento inteligente de placas NFC, registro de interações, painel administrativo, controle de estoque, clientes, vendas e métricas.

> **Progress. Products. Research. Technology.**

---

## Sobre o projeto

A proposta é simples:

O estabelecimento recebe uma placa NFC física.

O cliente aproxima o celular da placa e acessa uma URL da PPRT, por exemplo:

```text
https://pprtia.vercel.app/r/NFC1
```

O sistema identifica qual placa foi utilizada, registra a interação e redireciona o usuário para o link de avaliação da empresa no Google.

### Fluxo

```text
Cliente aproxima o celular
        ↓
Placa NFC
        ↓
/r/NFC1
        ↓
Sistema PPRT
        ↓
Consulta a placa no Supabase
        ↓
Registra o acesso
        ↓
Obtém o link do Google
        ↓
Redireciona o cliente
        ↓
Página de avaliação
```

Isso permite alterar o destino de uma placa posteriormente sem precisar regravar fisicamente o chip NFC.

---

# Funcionalidades

## Landing Page

Página pública responsável pela apresentação e comercialização do produto.

Atualmente apresenta:

- Placa NFC para avaliações
- Funcionamento do produto
- Benefícios
- Exemplos de utilização
- Métricas demonstrativas
- Informações comerciais
- CTA para contato

---

## Sistema de redirecionamento NFC

Cada placa possui um código único.

Exemplo:

```text
NFC1
NFC2
NFC3
...
```

A URL gravada fisicamente na placa segue o padrão:

```text
https://pprtia.vercel.app/r/NFC1
```

A rota dinâmica:

```text
/r/[codigo]
```

é responsável por:

1. receber o código da placa;
2. procurar a placa no banco de dados;
3. verificar se ela está ativa;
4. registrar o acesso;
5. recuperar o link de destino;
6. redirecionar o usuário.

---

## Painel Administrativo

O projeto também possui uma área administrativa privada:

```text
/admin/login
```

O painel centraliza a operação da PPRT.

### Dashboard

Visão geral de:

- placas;
- estoque;
- clientes;
- vendas;
- receita;
- despesas;
- acessos;
- indicadores da operação.

### Estoque

Controle das placas físicas disponíveis.

Cada placa pode possuir informações como:

- código;
- nome;
- status;
- data da compra;
- custo de aquisição;
- data da venda;
- preço de venda;
- data de instalação;
- cliente;
- contato;
- forma de pagamento;
- observações.

Status disponíveis:

```text
estoque
reservada
vendida
instalada
manutencao
inativa
```

---

## Clientes

Cadastro e gerenciamento de clientes contendo:

- nome;
- empresa;
- telefone;
- WhatsApp;
- e-mail;
- documento;
- endereço;
- observações.

---

## Vendas e financeiro

O sistema possui estrutura para acompanhamento de:

- vendas;
- itens vendidos;
- preço de venda;
- custo;
- formas de pagamento;
- pagamentos pendentes;
- pagamentos realizados;
- despesas;
- margem da operação.

---

## Métricas

Cada acesso realizado através de uma placa pode ser registrado.

Isso permite analisar informações como:

- quantidade de acessos;
- placas mais utilizadas;
- desempenho por placa;
- períodos com maior número de interações;
- evolução dos acessos.

### Importante

Uma interação registrada pelo sistema representa um **acesso à placa**.

Isso não significa necessariamente que uma avaliação foi concluída no Google.

```text
100 acessos ≠ 100 avaliações confirmadas
```

---

# Arquitetura

```text
                ┌─────────────────┐
                │    Placa NFC    │
                │      NFC1       │
                └────────┬────────┘
                         │
                         ▼
             ┌──────────────────────┐
             │ pprtia.vercel.app    │
             │      /r/NFC1         │
             └──────────┬───────────┘
                        │
                        ▼
               ┌────────────────┐
               │    Next.js     │
               │ Dynamic Route  │
               └───────┬────────┘
                       │
                       ▼
                ┌──────────────┐
                │   Supabase   │
                │              │
                │ placas       │
                │ acessos      │
                │ clientes     │
                │ vendas       │
                │ financeiro   │
                └───────┬──────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Google Avaliações │
              └───────────────────┘
```

---

# Tecnologias

O projeto utiliza:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Supabase**
- **PostgreSQL**
- **Vercel**
- **Lucide React**
- **Recharts**
- **Motion**
- **GSAP**
- **Git / GitHub**

---

# Banco de dados

O banco de dados é hospedado no Supabase.

Entre as principais tabelas estão:

```text
placas
acessos
placa_admin
clientes
vendas
venda_itens
pagamentos
despesas
configuracoes
admin_users
```

### `placas`

Contém as informações públicas necessárias para o funcionamento do redirecionamento NFC.

Exemplo conceitual:

```text
codigo: NFC1
nome_empresa: Empresa Exemplo
nome_placa: Placa Balcão
link_google: https://search.google.com/...
ativa: true
```

### `placa_admin`

Contém informações administrativas e privadas da placa.

Exemplo:

```text
status
custo_compra
preco_venda
data_compra
data_venda
data_instalacao
cliente
contato
forma_pagamento
observacoes
```

Dados financeiros e informações privadas não devem ficar expostos na tabela pública de placas.

---

# Segurança

O projeto utiliza autenticação do Supabase para o painel administrativo.

As tabelas administrativas utilizam **Row Level Security (RLS)** para restringir o acesso aos usuários autorizados.

A rota pública das placas possui apenas as permissões necessárias para seu funcionamento.

Nunca envie arquivos contendo credenciais para o GitHub.

O arquivo:

```text
.env.local
```

deve permanecer fora do versionamento.

---

# Variáveis de ambiente

Crie um arquivo:

```text
.env.local
```

com as variáveis necessárias do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=SEU_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
```

Não publique chaves privadas ou credenciais no repositório.

---

# Executando localmente

Clone o projeto:

```bash
git clone https://github.com/Bonaud13/nfc-avaliacoes.git
```

Entre na pasta:

```bash
cd nfc-avaliacoes
```

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra:

```text
http://localhost:3000
```

Painel administrativo:

```text
http://localhost:3000/admin/login
```

---

# Build de produção

Antes de realizar um deploy:

```bash
npm run build
```

O projeto deve concluir o build sem erros antes de ser enviado para produção.

---

# Deploy

O projeto está hospedado na **Vercel**.

Produção:

```text
https://pprtia.vercel.app
```

Painel:

```text
https://pprtia.vercel.app/admin/login
```

Exemplo de rota NFC:

```text
https://pprtia.vercel.app/r/NFC1
```

O deploy é realizado através da branch:

```text
main
```

Fluxo:

```text
Desenvolvimento local
        ↓
npm run build
        ↓
git commit
        ↓
git push origin main
        ↓
GitHub
        ↓
Vercel
        ↓
Produção
```

---

# Estrutura principal

```text
app/
├── admin/
├── api/
├── r/
│   └── [codigo]/
└── page.tsx

components/
├── admin/
└── landing/

lib/
├── supabase.ts
└── admin-auth.ts

public/
└── images/

supabase/
└── admin-dashboard.sql
```

---

# Modelo de negócio

O sistema começou como uma solução para placas NFC de avaliação, mas a proposta da PPRT vai além do produto físico.

A estrutura permite trabalhar também com:

- automação;
- analytics;
- análise de desempenho;
- marketing;
- estratégia digital;
- consultoria;
- soluções personalizadas para empresas.

A placa funciona como um dos pontos de entrada para o ecossistema PPRT.

---

# Status do projeto

O sistema está em desenvolvimento ativo.

Atualmente estão sendo trabalhados:

- aprimoramento da landing page;
- painel administrativo;
- gestão de estoque;
- cadastro e ativação das placas;
- gestão de clientes;
- vendas;
- financeiro;
- métricas;
- automações;
- melhoria da experiência de operação.

---

# PPRT.IA

**Progress. Products. Research. Technology.**

Tecnologia aplicada a problemas reais.
