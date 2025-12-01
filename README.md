# 🧘‍♀️ PLATAFORMA DIGITAL DE YOGA & WELLNESS (PROF. KARLA)

## Status do Projeto
[![Status](https://img.shields.io/badge/Status-Desenvolvimento%20Concluído-success.svg)](https://github.com/7UTI7/E-commerceYoga)
[![Última Sprint](https://img.shields.io/badge/Sprint-5%20(Finalizada)-blue.svg)](https://github.com/7UTI7/E-commerceYoga)

---

## 📝 Introdução
Este projeto consiste no desenvolvimento de uma Plataforma Digital Full-Stack (Backend Node.js/Express + Frontend React/Vite) destinada a instrutores de yoga. O sistema oferece funcionalidades de Gerenciamento de Conteúdo (CMS) e interação com o usuário, permitindo à professora administrar suas aulas e ao aluno acessar conteúdo seguro (como links de grupos) e interagir com o site (comentários, favoritos).

O principal objetivo da arquitetura foi garantir a **modularidade, segurança (via JWT) e escalabilidade** através de um sistema desacoplado (API RESTful).

---

## ✨ Funcionalidades Entregues (MVP)

### 🛡️ Segurança e Autenticação
* **Ciclo de Usuário Completo:** Registro, Login, Verificação de E-mail e Recuperação de Senha.
* **Autenticação JWT:** Uso de JSON Web Tokens (JWT) para proteger todas as rotas sensíveis.
* **Segurança de Senha:** Senhas armazenadas com **criptografia bcrypt** e validação de força (Regex).
* **Autorização por Papel:** Middlewares (`protect` e `admin`) garantem controle de acesso (RBAC).

### 🖼️ Gerenciamento de Mídia & Conteúdo
* **Upload para Nuvem:** Integração com **Cloudinary** para upload de imagens (Perfil e Posts), garantindo persistência em deploy serverless.
* **Publicação:** CRUD completo para **Artigos**, **Vídeos (YouTube)** e **Eventos**.
* **QoL Admin:** **Geração automática de Slug** para Artigos e Dashboard administrativo com gráficos.
* **Níveis:** Classificação de Aulas e Vídeos por Nível (Iniciante, Avançado, etc.).

### 🤝 Interação do Usuário
* **Favoritos:** Usuários logados podem favoritar vídeos.
* **Comentários:** Sistema de comentários em Artigos e Vídeos.
* **Comunidade:** Acesso restrito a links de **Grupos de WhatsApp**.

---

## ⚙️ Arquitetura e Padrões Aplicados

* **Arquitetura:** **API RESTful Desacoplada**. O Backend segue a arquitetura **MVC** (Model-Controller-Route).
* **Padrões de Projeto (Backend):**
    * **Decorator / Middleware:** Utilizado para adicionar camadas de validação e segurança às rotas.
    * **Singleton:** Aplicado na gestão da conexão do banco de dados (`dbConnect.js`).
    * **Factory:** Utilizado indiretamente na arquitetura de componentes do Frontend para renderização dinâmica.
* **Deploy (CI/CD):** Integração Contínua com **Render.com** (Backend) e **MongoDB Atlas**.

---

## 🛠️ Stack Tecnológica

| Módulo | Tecnologia | Função |
| :--- | :--- | :--- |
| **Backend** | Node.js / Express.js | Servidor web e API. |
| **Database** | MongoDB (Mongoose) | Banco de dados NoSQL. |
| **Deploy** | Render.com | Hospedagem em nuvem. |
| **Email** | Nodemailer / SendGrid | Envio de e-mails transacionais. |
| **Mídia** | Multer / Cloudinary | Upload e armazenamento de imagens. |
| **Front** | React.js / Vite | Interface do usuário SPA. |

---

## 💻 Configuração e Execução Local

Para rodar o projeto completo (Full-Stack), siga os passos abaixo.

### 1. Backend (API)

1.  **Clone o Repositório e instale:**
    ```bash
    git clone [https://github.com/7UTI7/E-commerceYoga](https://github.com/7UTI7/E-commerceYoga)
    cd E-commerceYoga/backend
    npm install
    ```

2.  **Configure o arquivo `.env`:**
    Crie um arquivo `.env` na pasta `backend/` com as seguintes chaves:
    ```env
    PORT=3001
    JWT_SECRET=SEU_SEGREDO_SUPER_SEGURO
    MONGODB_URI=mongodb://127.0.0.1:27017/yogadb
    
    # Cloudinary (Imagens)
    CLOUDINARY_CLOUD_NAME=seu_cloud_name
    CLOUDINARY_API_KEY=sua_api_key
    CLOUDINARY_API_SECRET=sua_api_secret

    # SendGrid (E-mails) - Opcional (sem isso usa Ethereal Fake)
    SMTP_HOST=smtp.sendgrid.net
    SMTP_PORT=587
    SMTP_EMAIL=apikey
    SMTP_PASSWORD=sua_chave_sendgrid
    SMTP_FROM_EMAIL=seu_email_verificado@exemplo.com
    ```

3.  **Inicie o Servidor:**
    ```bash
    npm run dev
    ```

### 2. Frontend (React)

1.  **Instale as dependências:**
    ```bash
    cd ../frontend
    npm install
    ```

2.  **Configure o ambiente:**
    Crie um arquivo `.env` na pasta `frontend/`:
    ```env
    VITE_API_URL=http://localhost:3001
    ```

3.  **Inicie o React:**
    ```bash
    npm run dev
    ```
    Acesse o projeto em `http://localhost:5173`.

---

## 👥 Membros do Grupo
* **Raphael Trindade Olho**
* **Pedro Graciani de Souza**
* **Matheus Fernandes Gobbi**
* **Luciano Rodrigues Campos Vitor**

---

## 📚 Disciplinas Chave e Satélites

#### Disciplinas Chave (Core):
* **Gestão Ágil de Projetos de Software**

#### Disciplinas Satélites (Contribuíram):
* **Desenvolvimento Web III**
* **Banco de Dados Não Relacional**
* **Interação Humano Computador**
