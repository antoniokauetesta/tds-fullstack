# Sistema de Gerenciamento de Oficina

React (Vite) + Node.js/Express + MySQL. Configuração por arquivos `.env`.

## Pré-requisitos
Node.js 18+ e MySQL 8+ (ou MariaDB 10.5+).

## 1. Banco de dados
```bash
mysql -u root -p < ../treino_db.sql
```

## 2. Back-end (API)
```bash
cd backend
cp .env.example .env      # edite DB_PASSWORD e JWT_SECRET
npm install
npm start                 # http://localhost:3001
```

## 3. Front-end
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Login de teste
| E-mail | Senha |
|---|---|
| admin@treino.com | Admin@123 |
| atendente@treino.com | Atend@123 |

## Estrutura
```
backend/src/server.js            servidor Express (principal)
backend/src/routes/auth.js       login / registro / logout / me
backend/src/routes/clientes.js   CRUD de clientes
backend/src/routes/veiculos.js   CRUD de veículos
backend/src/routes/agendamentos.js  CRUD de agendamentos + serviços
frontend/src/App.jsx             rotas e layout (principal)
frontend/src/pages/Login.jsx     tela de login
frontend/src/pages/Clientes.jsx | Veiculos.jsx | Agendamentos.jsx
frontend/src/components/CrudPage.jsx  CRUD genérico reutilizado
```
