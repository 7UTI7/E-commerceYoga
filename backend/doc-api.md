# 📜 Documentação da API de Yoga (Versão 1.2)

**URL Base:** `https://api-yoga-rapha.onrender.com`

---

## 🔑 Autenticação & Perfil do Usuário

### `POST /api/auth/register`
* **Descrição:** Registra um novo usuário (Aluno).
* **Body:** `{ "name": "...", "email": "...", "password": "..." }`
* **Nota:** A senha agora exige no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número.

### `POST /api/auth/login`
* **Descrição:** Autentica um usuário (Aluno ou Admin).
* **Body:** `{ "email": "...", "password": "..." }`
* **Retorna:** `{ _id, name, email, role, token }`

### `GET /api/auth/me`
* **Proteção:** **Requer Bearer Token** (de *qualquer* usuário logado).
* **Descrição:** Busca os dados do perfil do usuário logado.
* **Retorna:** `{ _id, name, email, role }`

### `PUT /api/auth/me`
* **Proteção:** **Requer Bearer Token**.
* **Descrição:** Atualiza o nome ou e-mail do usuário logado.
* **Body:** `{ "name": "...", "email": "..." }` (Pode enviar só um ou os dois).
* **Retorna:** `{ _id, name, email, role }`

### `PUT /api/auth/updatepassword`
* **Proteção:** **Requer Bearer Token**.
* **Descrição:** Atualiza a senha do usuário logado.
* **Body:** `{ "oldPassword": "...", "newPassword": "..." }`
* **Retorna:** `{ "message": "Senha atualizada com sucesso." }`

### `GET /api/auth/me/favorites`
* **Proteção:** **Requer Bearer Token**.
* **Descrição:** Retorna a lista de vídeos favoritados pelo usuário.
* **Retorna:** Uma lista `[]` de objetos de Vídeo.

---

## 📖 Artigos (Blog)

### `GET /api/articles`
* **Proteção:** Pública.
* **Descrição:** Lista todos os artigos com status "PUBLISHED".

### `GET /api/articles/:slug`
* **Proteção:** Pública.
* **Descrição:** Busca um único artigo publicado pelo seu `slug`.
* **Nota:** A resposta agora inclui `comments` populados com o `author.name`.

### `POST /api/articles`
* **Proteção:** **Admin** (Requer Bearer Token de Admin).
* **Descrição:** Cria um novo artigo.
* **Body:** `{ "title": "...", "content": "...", "status": "..." }`
* **Nota:** O `slug` é gerado automaticamente pelo backend.

### `PUT /api/articles/:id`
* **Proteção:** **Admin** (Requer Bearer Token de Admin).
* **Descrição:** Atualiza um artigo existente.
* **Body:** `{ "title": "...", "content": "...", "status": "..." }`

### `DELETE /api/articles/:id`
* **Proteção:** **Admin** (Requer Bearer Token de Admin).
* **Descrição:** Deleta um artigo.

### `POST /api/articles/:id/comments`
* **Proteção:** **Logado** (Requer Bearer Token de *qualquer* usuário).
* **Descrição:** Adiciona um novo comentário a um artigo.
* **Body:** `{ "content": "..." }`
* **Retorna:** O novo objeto de comentário, com o autor populado.

---

## 🎬 Vídeos

### `GET /api/videos`
* **Proteção:** Pública.
* **Descrição:** Lista todos os vídeos.

### `GET /api/videos/:id`
* **Proteção:** Pública.
* **Descrição:** Busca um único vídeo pelo seu `_id`.
* **Nota:** A resposta agora inclui `comments` populados com o `author.name`.

### `POST /api/videos`
* **Proteção:** **Admin** (Requer Bearer Token de Admin).
* **Descrição:** Adiciona um novo vídeo.
* **Body:** `{ "title": "...", "description": "...", "youtubeUrl": "...", "category": "...", "level": "Iniciante" }`

### `PUT /api/videos/:id`
* **Proteção:** **Admin** (Requer Bearer Token de Admin).
* **Descrição:** Atualiza um vídeo.
* **Body:** `{ "title": "...", "level": "Avançado" }` (etc.)

### `DELETE /api/videos/:id`
* **Proteção:** **Admin** (Requer Bearer Token de Admin).
* **Descrição:** Deleta um vídeo.

### `POST /api/videos/:id/favorite`
* **Proteção:** **Logado** (Requer Bearer Token de *qualquer* usuário).
* **Descrição:** Adiciona ou remove um vídeo dos favoritos do usuário.
* **Body:** (Vazio)
* **Retorna:** `{ "message": "Vídeo adicionado/removido dos favoritos." }`

### `POST /api/videos/:id/comments`
* **Proteção:** **Logado** (Requer Bearer Token de *qualquer* usuário).
* **Descrição:** Adiciona um novo comentário a um vídeo.
* **Body:** `{ "content": "..." }`
* **Retorna:** O novo objeto de comentário.

---

## 🗓️ Eventos (Workshops, Retiros)

*(Sem mudanças nesta sprint)*
* `GET /api/events` (Público - Lista eventos futuros)
* `GET /api/events/:id` (Público - Busca um evento)
* `POST /api/events` (Admin - Requer Bearer Token)
* `PUT /api/events/:id` (Admin - Requer Bearer Token)
* `DELETE /api/events/:id` (Admin - Requer Bearer Token)

---

## 🧘‍♀️ Aulas (Agenda Semanal)

* `GET /api/class-slots` (Público - Lista aulas futuras)
* `GET /api/class-slots/:id` (Público - Busca uma aula)
* `POST /api/class-slots` (Admin - Requer Bearer Token)
    * **Body:** `{ "title": "...", "description": "...", "dateTime": "...", "durationMinutes": 60, "maxStudents": 10, "level": "Iniciante" }`
* `PUT /api/class-slots/:id` (Admin - Requer Bearer Token)
    * **Body:** `{ "title": "...", "level": "Intermediário" }` (etc.)
* `DELETE /api/class-slots/:id` (Admin - Requer Bearer Token)

---

## 💬 Grupos de WhatsApp

* `GET /api/whatsapp-groups` (Logado - Requer Bearer Token de *Student* ou *Admin*)
* `POST /api/whatsapp-groups` (Admin - Requer Bearer Token)
* `PUT /api/whatsapp-groups/:id` (Admin - Requer Bearer Token)
* `DELETE /api/whatsapp-groups/:id` (Admin - Requer Bearer Token)