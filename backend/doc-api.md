## 📜 Documentação da API de Yoga (MVP)

**URL Base:** [https://api-yoga-rapha.onrender.com] 

---

### 🔑 Autenticação

### 🔑 Autenticação & Perfil do Usuário

* `POST /api/auth/register`
    * **Body:** `{ "name": "...", "email": "...", "password": "..." }`
    * **Nota:** A senha agora exige no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número.
* `POST /api/auth/login`
    * **Body:** `{ "email": "...", "password": "..." }`
    * **Retorna:** `{ _id, name, email, role, token }`

* `GET /api/auth/me` (NOVO)
    * **Proteção:** **Requer Bearer Token** (de *qualquer* usuário logado, Student ou Admin).
    * **Retorna:** Dados do perfil: `{ _id, name, email, role }`
* `PUT /api/auth/me` (NOVO)
    * **Proteção:** **Requer Bearer Token** (de *qualquer* usuário logado).
    * **Body:** `{ "name": "...", "email": "..." }` (Pode enviar só um ou os dois).
    * **Retorna:** Dados atualizados: `{ _id, name, email, role }`
* `PUT /api/auth/updatepassword` (NOVO)
    * **Proteção:** **Requer Bearer Token** (de *qualquer* usuário logado).
    * **Body:** `{ "oldPassword": "...", "newPassword": "..." }`
    * **Nota:** `newPassword` deve seguir a regra de senha forte.
    * **Retorna:** `{ "message": "Senha atualizada com sucesso." }`
*(Nota: A rota /register também existe, mas não é necessária para o painel de admin)*

---

### 📖 Artigos (Blog)

* `GET /api/articles` (Público - Lista todos os publicados)
* `GET /api/articles/:slug` (Público - Busca um artigo)
* `POST /api/articles` (Admin - **Requer Bearer Token**)
* `PUT /api/articles/:id` (Admin - **Requer Bearer Token**)
* `DELETE /api/articles/:id` (Admin - **Requer Bearer Token**)

---

### 🎬 Vídeos

* `GET /api/videos` (Público - Lista todos)
* `GET /api/videos/:id` (Público - Busca um vídeo)
* `POST /api/videos` (Admin - **Requer Bearer Token**)
* `PUT /api/videos/:id` (Admin - **Requer Bearer Token**)
* `DELETE /api/videos/:id` (Admin - **Requer Bearer Token**)

---

### 🗓️ Eventos (Workshops, Retiros)

* `GET /api/events` (Público - Lista eventos futuros)
* `GET /api/events/:id` (Público - Busca um evento)
* `POST /api/events` (Admin - **Requer Bearer Token**)
* `PUT /api/events/:id` (Admin - **Requer Bearer Token**)
* `DELETE /api/events/:id` (Admin - **Requer Bearer Token**)

---

### 🧘‍♀️ Aulas (Agenda Semanal)

* `GET /api/class-slots` (Público - Lista aulas futuras)
* `GET /api/class-slots/:id` (Público - Busca uma aula)
* `POST /api/class-slots` (Admin - **Requer Bearer Token**)
* `PUT /api/class-slots/:id` (Admin - **Requer Bearer Token**)
* `DELETE /api/class-slots/:id` (Admin - **Requer Bearer Token**)