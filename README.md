# Онлайн-библиотека

Веб-приложение для поиска книг через Open Library API, управления списком чтения, лайками и комментариями.

**Тестовое задание от TwelveDevs**

---

Быстрый старт

 Предварительные требования
- Node.js >= 22 (LTS) — версия указана в `.nvmrc`
- npm >= 10
- Аккаунт Supabase (бесплатный тариф)

 1. Клонирование репозитория
```bash
git clone https://github.com/<your-username>/online-library-<surname>.git
cd online-library-<surname>

2. Настройка бэкенда
cd backend
cp .env.example .env
# Отредактируйте .env — укажите SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET
npm install
npm run dev

Бэкенд запустится на http://localhost:5000
Swagger документация: http://localhost:5000/api-docs

3. Настройка фронтенда
cd frontend
cp .env.example .env
npm install
npm run dev
Фронтенд запустится на http://localhost:3000

4. Запуск тестов
cd backend
npm test

Архитектура
Проект построен по принципу разделения ответственности (Separation of Concerns) с трёхслойной архитектурой на бэкенде:
backend/src/
├── controllers/        ← Обработка HTTP-запросов (req/res)
│   ├── authController.ts
│   ├── booksController.ts
│   ├── commentsController.ts
│   ├── likesController.ts
│   ├── profileController.ts
│   └── readingListController.ts
├── services/           ← Бизнес-логика
│   ├── authService.ts
│   ├── booksService.ts
│   ├── commentsService.ts
│   ├── likesService.ts
│   ├── profileService.ts
│   └── readingListService.ts
├── repositories/       ← Работа с базой данных (Supabase)
│   ├── commentsRepository.ts
│   ├── likesRepository.ts
│   ├── readingListRepository.ts
│   └── usersRepository.ts
├── middleware/         ← Middleware (авторизация)
│   └── authMiddleware.ts
├── utils/              ← Утилиты
│   ├── cache.ts                    # In-memory кеш (node-cache)
│   ├── openLibraryThrottle.ts      # Throttling запросов к Open Library
│   ├── supabase.ts                 # Клиент Supabase
│   └── swagger.ts                  # Настройка Swagger UI
├── __tests__/          # Unit-тесты (Vitest)
│   ├── throttle.test.ts
│   └── validation.test.ts
── swagger-output.json # OpenAPI 3.0 спецификация
└── index.ts            # Точка входа

Поток запроса
HTTP Request → Controller → Service → Repository → Supabase (PostgreSQL)
                                    ↓
                              Open Library API (с кешированием и throttling)

Технологический стек

Бэкенд
Runtime: Node.js 22 (LTS)
Язык: TypeScript
Фреймворк: Express.js
База данных: Supabase (PostgreSQL)
ORM/SDK: @supabase/supabase-js
Аутентификация: JWT (jsonwebtoken)
Хэширование паролей: bcrypt
HTTP-клиент: Axios (для внешних API)
Кеширование: node-cache (in-memory, TTL 30 мин)
Документация API: Swagger UI (OpenAPI 3.0)
Тесты: Vitest

Фронтенд
Фреймворк: React 18
Сборщик: Vite
Язык: TypeScript
Маршрутизация: React Router v6
Стилизация: Tailwind CSS
HTTP-клиент: Axios
Хранение токена: localStorage

База данных
Схема (Supabase / PostgreSQL)
┌────────────┐
│     users      │
├────────────┤
│ id (UUID, PK)   │
│ login (unique)  │
│ password_hash   │
│ created_at      │
└────────────┘
         │
         │ 1:N
         ▼
┌────────────┐    ┌──────────────┐    ┌────────────┐
│     likes       │    │   reading_list   │    │   comments      │
├────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)         │    │ id (PK)          │    │ id (UUID, PK)   │
│ user_id (FK)    │    │ user_id (FK)     │    │ user_id (FK)    │
│ book_olid       │    │ book_olid        │    │ book_olid       │
│ created_at      │    │ status (enum)    │    │ text            │
└────────────┘    │ created_at       │    │ created_at      │
                       │ updated_at       │    │ updated_at      │
                       └─────────────┘    └─────────────┘

Ключевые особенности
Уникальность: составные unique-ключи (user_id, book_olid) в таблицах likes и reading_list — пользователь не может лайкнуть книгу дважды или добавить её в список чтения дважды
Внешние ключи: все таблицы связаны через user_id → users.id
Статусы списка чтения: want_to_read, reading, read
Книги не хранятся в БД — только их идентификаторы olid (Open Library ID). Название, автор, обложка запрашиваются из Open Library API
ER-диаграмма: см. docs/database.jpeg

Безопасность
JWT-токены передаются в заголовке Authorization: Bearer <token>
Пароли хэшируются через bcrypt (стоимость 10) перед сохранением в БД
Уникальность логина проверяется при регистрации
Middleware авторизации защищает все приватные роуты
Проверка владельца комментария — пользователь может редактировать/удалять только свои комментарии
SQL-инъекции исключены — Supabase SDK использует параметризованные запросы

API Endpoints
Полная интерактивная документация доступна по адресу: http://localhost:5000/api-docs
Auth
POST /api/auth/register — регистрация
POST /api/auth/login — вход (возвращает JWT)
Books (публичные)
GET /api/books/search?q=... — поиск книг
GET /api/books/{olid} — детали книги
GET /api/books/{bookOlid}/likes — количество лайков
GET /api/books/{bookOlid}/comments — комментарии к книге
Likes (требуют авторизации)
GET /api/likes — список лайков пользователя
POST /api/likes — поставить лайк
DELETE /api/likes/{bookOlid} — убрать лайк
Comments (требуют авторизации)
GET /api/comments — мои комментарии
POST /api/comments — создать комментарий
PUT /api/comments/{commentId} — редактировать комментарий
DELETE /api/comments/{commentId} — удалить комментарий
Reading List (требуют авторизации)
GET /api/reading-list — мой список чтения
POST /api/reading-list — добавить книгу
PUT /api/reading-list/{bookOlid} — изменить статус
DELETE /api/reading-list/{bookOlid} — удалить из списка
Profile (требуют авторизации)
GET /api/profile — получить профиль
PUT /api/profile/login — сменить логин
PUT /api/profile/password — сменить пароль
GET /api/users/{userId} — получить пользователя по ID

Кеширование и Throttling
Кеширование (in-memory)
Библиотека: node-cache
TTL: 30 минут (1800 секунд)
Ключи: search:{q}:page:{n} для поиска, book:{olid} для деталей
Логика: при первом запросе — [CACHE MISS], при повторном — [CACHE HIT]
Что кешируется: только запросы к Open Library API. Данные пользователя (лайки, комментарии, список чтения) всегда свежие из БД
Throttling
Лимит Open Library: ~1 запрос/сек
Реализация: очередь запросов с задержкой 1.1 сек между ними
Модуль: src/utils/openLibraryThrottle.ts
Подтверждение тестом: 3 запроса выполняются за ~3.3 сек (3 × 1.1 сек)

Тесты
Фреймворк: Vitest
cd backend
npm test

Покрытие
validation.test.ts — валидация OLID, статусов списка чтения, email (3 теста)
throttle.test.ts — проверка throttling механизма и работы кеша (3 теста)
Итого: 6 тестов, все проходят 

Структура проекта
online-library-pligina/
├── backend/              # Бэкенд (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── __tests__/
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── .nvmrc
│   └── package.json
├── frontend/             # Фронтенд (React + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── context/
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── package.json
├── docs/                 # Документация
│   ├── results.docx      # Скриншоты приложения
│   ├── database.jpeg     # ER-диаграмма
│   └── AI_USAGE.md       # Описание использования AI
├── .gitignore
├── .nvmrc
└── README.md             # Этот файл

Скриншоты
Скриншоты всех основных страниц и работы API находятся в папке docs/results.docx:
Регистрация и вход
Главная страница с поиском
Страница деталей книги
Мои лайки
Список чтения с фильтрацией
История комментариев
Профиль пользователя
Поиск по своим книгам
Swagger UI (все endpoint'ы)
Демонстрация кеширования ([CACHE MISS] → [CACHE HIT])

Использование AI
При разработке использовались AI-инструменты. Подробное описание — в файле docs/AI_USAGE.md.

Автор
Pligina Vika