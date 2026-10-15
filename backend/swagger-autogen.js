const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Online Library API',
    description: 'Документация API для приложения Онлайн-библиотека',
    version: '1.0.0',
  },
  host: 'localhost:5000',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Auth', description: 'Аутентификация' },
    { name: 'Profile', description: 'Профиль пользователя' },
    { name: 'Books', description: 'Книги' },
    { name: 'Likes', description: 'Лайки' },
    { name: 'Comments', description: 'Комментарии' },
    { name: 'ReadingList', description: 'Список чтения' },
    { name: 'MyBooks', description: 'Поиск по моим книгам' },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT токен в формате: Bearer <token>',
    },
  },
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ Swagger документация сгенерирована!');
});