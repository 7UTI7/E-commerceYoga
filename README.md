# 🧘‍♀️ PLATAFORMA DIGITAL DE YOGA & WELLNESS (PROF. KARLA)

## Status do Projeto
[![Status](https://img.shields.io/badge/Status-Desenvolvimento%20Concluído-success.svg)](https://github.com/SEU_USUARIO/SEU_REPOSITORIO)
[![Última Sprint](https://img.shields.io/badge/Sprint-5%20(Finalizada)-blue.svg)](https://github.com/SEU_USUARIO/SEU_REPOSITORIO)

---

## 📝 Introdução
Este projeto consiste no desenvolvimento de uma Plataforma Digital Full-Stack (Backend Node.js/Express + Frontend React/Vite) destinada a instrutores de yoga. O sistema oferece funcionalidades de Gerenciamento de Conteúdo (CMS) e interação com o usuário, permitindo à professora administrar suas aulas e ao aluno acessar conteúdo seguro (como links de grupos) e interagir com o site (comentários, favoritos).

O principal objetivo da arquitetura foi garantir a **modularidade, segurança (via JWT) e escalabilidade** através de um sistema desacoplado (API RESTful).

---

## ✨ Funcionalidades Entregues (MVP)

### 🛡️ Segurança e Autenticação
* **Ciclo de Usuário Completo:** Registro, Login e Gerenciamento de Perfil.
* **Autenticação JWT:** Uso de JSON Web Tokens (JWT) para proteger todas as rotas sensíveis.
* **Segurança de Senha:** Senhas armazenadas com **criptografia bcrypt** e validação de força (Regex) no lado do servidor.
* **Autorização por Papel:** Middlewares (`protect` e `admin`) garantem que apenas a professora (Role: ADMIN) possa acessar rotas de criação/edição.

### 🖼️ Gerenciamento de Mídia & Conteúdo
* **Upload para Nuvem:** Implementação de um sistema de upload de imagens genérico para **Cloudinary**, garantindo que as imagens não sejam perdidas no deploy (Render).
* **Publicação:** CRUD (Create, Read, Update, Delete) completo para **Artigos**, **Vídeos (YouTube)** e **Eventos (Workshops)**.
* **QoL Admin:** **Geração automática de Slug** para Artigos, simplificando o trabalho da Admin.
* **Níveis:** Classificação de Aulas e Vídeos por Nível (Iniciante, Avançado, etc.).

### 🤝 Interação do Usuário
* **Favoritos:** Usuários logados podem favoritar/desfavoritar vídeos, com uma rota para listar seus favoritos.
* **Comentários:** Usuários logados podem postar comentários em Artigos e Vídeos.
* **Comunidade:** Rota protegida para visualizar links de **Grupos de WhatsApp** (comunidade).

---

## ⚙️ Arquitetura e Padrões Aplicados

* **Arquitetura:** **API RESTful Desacoplada** (Frontend e Backend independentes, comunicando-se via JSON). O Backend segue a arquitetura **MVC** (Model-Controller-Route).
* **Padrões de Projeto (Backend):**
    * **Decorator / Chain of Responsibility:** Implementado através dos **Middlewares** do Express.js (ex: `protect`, `admin`) para adicionar camadas de segurança (autenticação e autorização) às rotas.
    * **Singleton:** Aplicado na gestão da conexão do banco de dados (`dbConnect.js`) para otimizar recursos e evitar o gasto desnecessário de pools de conexão.
* **Deploy (CI/CD):** Configuração de Integração Contínua/Entrega Contínua. O código é atualizado e implantado (deployed) automaticamente no Render a cada `git push` no repositório.

---

## 🛠️ Stack Tecnológica

| Módulo | Tecnologia | Função |
| :--- | :--- | :--- |
| **Backend** | Node.js / Express.js | Servidor web e roteamento da API. |
| **Database** | MongoDB (Mongoose) | Banco de dados NoSQL flexível e persistência de dados. |
| **Deploy** | Render.com | Hospedagem contínua (CI/CD) do servidor. |
| **Autenticação**| JWT (JSON Web Tokens) | Geração de tokens de sessão seguros. |
| **Segurança** | bcryptjs / crypto | Hash de senhas e geração de tokens de uso único. |
| **Mídia/Upload** | Multer, Cloudinary | Processamento de arquivos e armazenamento de imagens na nuvem. |
| **Front** (Ref.) | React.js / Vite | Construção da interface de usuário reativa. |

---

## 💻 Configuração e Execução Local

Para rodar o projeto localmente, você precisará de um servidor MongoDB local (Community Server) e credenciais válidas.

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/7UTI7/E-commerceYoga
    cd E-commerceYoga/backend
    ```

2.  **Instale Dependências e Configure o Ambiente:**
    ```bash
    npm install
    ```
    Crie o arquivo `.env` na raiz da pasta `backend/` e adicione as variáveis mínimas:
    ```env
    PORT=3001
    JWT_SECRET=UM_SEGREDO_LONGO
    MONGODB_URI=mongodb://127.0.0.1:27017/yogadb # Para rodar localmente
    CLOUDINARY_CLOUD_NAME=seu_nome_aqui
    CLOUDINARY_API_KEY=sua_chave_aqui
    CLOUDINARY_API_SECRET=seu_segredo_aqui
    ```

3.  **Inicie o Banco de Dados Local:**
    * Garanta que o serviço **MongoDB Community Server** esteja ativo em segundo plano.

4.  **Inicie o Backend:**
    ```bash
    npm run dev
    ```
    O servidor estará ativo em `http://localhost:3001`.

5.  **Inicie o Frontend:**
    * (Navegue até a pasta `frontend/`) e rode o comando de desenvolvimento (ex: `npm run dev`).

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
