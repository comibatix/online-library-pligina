import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Загружаем готовую Swagger-спецификацию из JSON файла
const swaggerSpecPath = path.join(__dirname, 'swagger-output.json');
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerSpecPath, 'utf-8'));

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ Swagger документация доступна по адресу: http://localhost:5000/api-docs');
};