# PPRT / CONTROL

Painel administrativo para o projeto `nfc-avaliacoes`.

## O que foi adicionado

- Login com Supabase Auth e lista explícita de administradores.
- Visão geral com receita, resultado, estoque, vendas, acessos e contas a receber.
- Gestão de placas com:
  - código NFC;
  - nome da empresa;
  - nome da placa;
  - link do Google;
  - cliente;
  - contato;
  - data e custo da compra;
  - data e preço da venda;
  - data e local da instalação;
  - forma de pagamento;
  - observações;
  - status e ativação da rota.
- Clientes.
- Estoque e custo imobilizado.
- Financeiro: vendas, despesas, formas de pagamento e recebíveis.
- Métricas de acesso às placas por dia, horário e placa.
- GitHub: repositório, commits recentes e último GitHub Actions.
- PageSpeed/Lighthouse: Performance, Acessibilidade, Boas Práticas e SEO em mobile e desktop.
- Configurações operacionais.
- Workflow de build no GitHub Actions.

## Segurança importante

Os dados privados NÃO foram adicionados à tabela pública `placas`.
Eles ficam em `placa_admin`, protegida por RLS.

A rota NFC pública continua usando a tabela `placas` e `acessos`.

## Instalação

1. Na raiz do projeto:
   ```bash
   bash pprt-admin-install.sh
   ```

2. Abra o Supabase > SQL Editor e execute:
   `supabase/admin-dashboard.sql`

3. Em Supabase > Authentication > Users, crie seu usuário de admin com email e senha.

4. Depois execute no SQL Editor:
   ```sql
   insert into public.admin_users (user_id, nome)
   select id, 'Geison'
   from auth.users
   where email = 'SEU_EMAIL';
   ```

5. Adicione as variáveis de `pprt-admin.env.example` ao `.env.local` e ao Vercel.

6. Rode:
   ```bash
   npm run dev
   ```

7. Acesse:
   `http://localhost:3000/admin/login`

## GitHub API

Para repositório público o painel consegue ler os endpoints sem token, sujeito ao limite público da API.
Para uso constante, configure `GITHUB_TOKEN` somente no servidor/Vercel.

## PageSpeed

`PAGESPEED_API_KEY` é opcional. Sem chave, a API pode funcionar com cota mais limitada.
O painel nunca expõe essa chave ao navegador.

## Observação sobre métricas

`acessos` mede aproximações/acessos às placas. Isso não significa que uma avaliação no Google foi efetivamente enviada.
