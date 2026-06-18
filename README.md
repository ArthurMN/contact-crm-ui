# Contact CRM UI

Frontend React para consumir a API Contact CRM.

## Tecnologias

- Vite
- React
- Material UI
- Fetch API

## Requisitos

- Node.js 20 ou superior
- npm
- API `contact-crm-api` em execucao

## Como executar

1. Instale as dependencias:

```bash
npm install
```

2. Inicie a API em `http://localhost:3000`.

3. Inicie o frontend:

```bash
npm run dev
```

4. Acesse a URL exibida pelo Vite.

## Configuracao da API

Em desenvolvimento, o Vite usa proxy local:

```text
/api -> http://localhost:3000
```

Para apontar para outra URL, defina:

```bash
VITE_API_URL=http://localhost:3000
```

## Funcionalidades

- Login
- Cadastro de usuario
- Dashboard do CRM
- Cadastro, listagem, edicao e remocao de contatos
- Registro, listagem e remocao de interacoes
- Cadastro, listagem, edicao e remocao de oportunidades

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
