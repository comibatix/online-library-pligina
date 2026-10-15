# Бэкенд Онлайн-библиотеки

REST API на Node.js + Express + TypeScript с интеграцией Supabase (PostgreSQL) и Open Library API.

---

## Технологический стек

- **Runtime:** Node.js 22 (LTS)
- **Язык:** TypeScript
- **Фреймворк:** Express.js
- **База данных:** Supabase (PostgreSQL)
- **SDK:** @supabase/supabase-js
- **Аутентификация:** JWT (jsonwebtoken)
- **Хэширование:** bcrypt
- **Кеширование:** node-cache (in-memory, TTL 30 мин)
- **Документация API:** Swagger UI (OpenAPI 3.0)
- **Тесты:** Vitest

---

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install

2. Настройка переменных окружения
cp .env.example .env
Отредактируйте .env:
# Порт сервера
PORT=5000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT
JWT_SECRET=your-jwt-secret-here-change-in-production
JWT_EXPIRES_IN=7d

3. Запуск в режиме разработки
npm run dev

Сервер запустится на http://localhost:5000
Swagger документация: http://localhost:5000/api-docs

4. Сборка для продакшена
npm run build
npm start

5. Запуск тестов
npm test

Архитектура
Проект использует трёхслойную архитектуру (Separation of Concerns):
src/
├── controllers/        ← Обработка HTTP-запросов (req/res, валидация ввода)
├── services/           ← Бизнес-логика (правила, проверки, оркестрация)
├── repositories/       ← Работа с базой данных (Supabase запросы)
├── middleware/         ← Middleware (authMiddleware для JWT)
├── utils/              ← Утилиты (cache, throttle, supabase client, swagger)
├── __tests__/          ← Unit-тесты (Vitest)
└── index.ts            # Точка входа

Поток запроса
HTTP Request → Controller → Service → Repository → Supabase
                                    ↓
                              Open Library API (с кешированием + throttling)

Пример: добавление лайка
likesController.addLike() — принимает req.body, вызывает сервис
likesService.addLike() — проверяет, не стоит ли уже лайк, вызывает репозиторий
likesRepository.addLike() — выполняет INSERT в Supabase

API Endpoints
Полная интерактивная документация: http://localhost:5000/api-docs

Auth
POST /api/auth/register Регистрация нового пользователя
POST /api/auth/login Вход (возвращает JWT)

Books (публичные)
GET /api/books/search?q=… Поиск книг в Open Library
GET /api/books/{olid} Детали книги
GET /api/books/{bookOlid}/likes Количество лайков книги
GET /api/books/{bookOlid}/comments Комментарии к книге

Likes (требуют JWT)
GET /api/likes Список лайков пользователя
POST /api/likes Поставить лайк
DELETE /api/likes/{bookOlid} Убрать лайк

Comments (требуют JWT)
GET /api/comments Мои комментарии
POST /api/comments Создать комментарий
PUT /api/comments/{commentId} Редактировать свой комментарий
DELETE /api/comments/{commentId} Удалить свой комментарий

Reading List (требуют JWT)
GET /api/reading-list Мой список чтения
POST /api/reading-list Добавить книгу
PUT /api/reading-list/{bookOlid} Изменить статус
DELETE /api/reading-list/{bookOlid} Удалить из списка

Profile (требуют JWT)
GET /api/profile Получить профиль
PUT /api/profile/login Сменить логин
PUT /api/profile/password Сменить пароль
GET /api/users/{userId} Получить пользователя по ID

База данных (Supabase)
Таблицы
-users — id (UUID), login (unique), password_hash, created_at
-likes — id, user_id (FK), book_olid, created_at (unique: user_id + book_olid)
-comments — id (UUID), user_id (FK), book_olid, text, created_at, updated_at
-reading_list — id, user_id (FK), book_olid, status (enum), created_at, updated_at (unique: user_id + book_olid)

Статусы списка чтения
want_to_read — хочу прочитать
reading — читаю сейчас
read — прочитано

Книги в БД не хранятся — только их идентификаторы olid (Open Library ID). Название, автор, обложка запрашиваются из Open Library API.

Кеширование
Библиотека: node-cache (in-memory)
TTL: 30 минут (1800 секунд)
Модуль: src/utils/cache.ts

Ключи кеша
Поиск: search:{запрос}:page:{номер}
Детали книги: book:{olid}
Throttle: throttle:{url}

Логика
Первый запрос → данные берутся из Open Library → сохраняются в кеш → лог [CACHE MISS]
Повторный запрос в течение 30 минут → данные берутся из кеша → лог [CACHE HIT]
Данные пользователя (лайки, комментарии, список чтения) не кешируются — всегда свежие из БД

Throttling запросов к Open Library
Проблема: Open Library ограничивает ~1 запрос/сек. Параллельные запросы могут привести к ошибке 429.
Решение: очередь запросов с задержкой 1.1 сек между ними.
Модуль: src/utils/openLibraryThrottle.ts

Как работает
-Запрос попадает в очередь
-Обработчик берёт запросы по одному
-Между запросами — пауза 1100 мс
-Результат кешируется

Подтверждение тестом
3 последовательных запроса выполняются за ~3.3 секунды (3 × 1.1 сек), что подтверждает корректность throttling.

Безопасность
JWT-токены в заголовке Authorization: Bearer <token>
Пароли хэшируются через bcrypt (стоимость 10)
Уникальность логина проверяется при регистрации
Middleware авторизации защищает все приватные роуты
Проверка владельца комментария — редактировать/удалять можно только свои
SQL-инъекции исключены — Supabase SDK использует параметризованные запросы

Тесты
Фреймворк: Vitest
Команда: npm test
Покрытие
validation.test.ts — валидация OLID, статусов списка чтения, email (3 теста)
throttle.test.ts — проверка throttling механизма и работы кеша (3 теста)
Итого: 6 тестов, все проходят 

Переменные окружения
PORT Порт сервера 5000
SUPABASE_URL URL проекта Supabase https://xxx.supabase.co
SUPABASE_ANON_KEY Публичный ключ Supabase eyJ...
SUPABASE_SERVICE_ROLE_KEY Сервисный ключ Supabase eyJ… 
JWT_SECRET Секрет для подписи JWT your-secret
JWT_EXPIRES_IN Время жизни токена 7d

Скрипты npm
npm run dev Запуск в режиме разработки (tsx watch)
npm run build Сборка TypeScript
npm start Запуск собранной версии
npm test Запуск тестов (Vitest)

Автор
Pligina Vika