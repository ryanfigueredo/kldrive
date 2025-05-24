# KL Facilities - Sistema de Gestão de Veículos

Sistema web para gestão operacional da KL Facilities, com foco em registro de quilometragem, abastecimento, upload de imagens e controle de usuários com autenticação segura.

---

## Tecnologias

- Next.js 13 (App Router)
- React (com Hooks)
- TypeScript
- Prisma ORM com PostgreSQL
- NextAuth para autenticação com credenciais
- AWS S3 para armazenamento de imagens
- Tailwind CSS + Shadcn UI para interface
- Formidable para upload de arquivos no backend

---

## Funcionalidades

- Cadastro, edição e listagem de usuários com senhas seguras (bcrypt)
- Login via email e senha com sessão JWT (NextAuth)
- Cadastro de veículos e vinculação com usuários
- Registro de quilometragem com upload de foto do odômetro
- Registro de abastecimento com upload de comprovante
- Visualização do histórico recente de quilometragem e abastecimento
- Dashboard com status do veículo vinculado ao usuário
- Uploads seguros para AWS S3 com URLs públicas para acesso
- Controle de permissões por perfil (colaborador, supervisor, admin)

---

## Instalação e Configuração

### Requisitos

- Node.js 18+
- PostgreSQL rodando localmente ou em nuvem
- Conta AWS com S3 configurado (bucket e usuário IAM com permissão `PutObject`)
- Variáveis de ambiente configuradas no arquivo `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
NEXTAUTH_SECRET=seusegredosecreto
AWS_ACCESS_KEY_ID=sua-chave-aws
AWS_SECRET_ACCESS_KEY=sua-chave-secreta
AWS_REGION=sua-regiao
AWS_BUCKET_NAME=nome-do-bucket

## Estrutura do Projeto
/src/app — rotas e páginas Next.js (App Router)

/src/app/api — endpoints API para usuários, veículos, registros e autenticação

/src/components — componentes React reutilizáveis (upload, selects, botões)

/src/lib/prisma.ts — cliente Prisma configurado

/src/lib/s3.ts — função de upload para AWS S3

/src/app/api/auth/[...nextauth].ts — configuração NextAuth

/src/app/(private) — rotas protegidas por autenticação

Uso
Cadastro de Usuário
Usuários são criados via API com email, senha (criptografada), perfil e veículo vinculado.

Login
Autenticação por email e senha, gerando sessão JWT.

Registro de Quilometragem
Usuário seleciona veículo vinculado, informa km, observação e faz upload da foto do odômetro.

Registro de Abastecimento
Usuário informa litros, valor, situação do tanque, km atual e faz upload do comprovante.

Visualização
Dashboard exibe veículo vinculado, últimos registros e acesso rápido para cadastro.

Segurança
Senhas são armazenadas criptografadas com bcrypt.

Rotas protegidas por NextAuth.

Uploads autenticados e armazenados com permissão restrita no S3.

Token JWT com perfil e veículos associados.

Melhorias Futuras
Implementar recuperação de senha.

Permitir edição de registros.

Notificações e alertas para revisões de veículos.

Multiusuário e níveis avançados de permissão.

Dashboard com gráficos e análises.

Contato
Para dúvidas, sugestões ou suporte:

Ryan Figueredo
```
