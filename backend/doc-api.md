## 📜 Documentação da API de Yoga (MVP)

**URL Base:** [ https://large-wolves-brush.loca.lt] 

---

### 🔑 Autenticação

* `POST /api/auth/login` (Para o Painel de Admin)
    * **Body:** `{ "email": "...", "password": "..." }`
    * **Retorna:** `{ user, token }`

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