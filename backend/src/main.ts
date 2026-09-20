import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowOrigins = configService.get<string>('ALLOW_ORIGINS');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const baseUrlStr = configService.get<string>('BASE_URL', '');

  let allowedOrigins: any = true;

  if (allowOrigins) {
    allowedOrigins = allowOrigins.split(',').map((o) => o.trim());
  } else if (nodeEnv === 'production' && baseUrlStr) {
    try {
      const url = new URL(baseUrlStr);
      const domain = url.hostname;
      allowedOrigins = [
        baseUrlStr,
        `https://admin.${domain}`,
        `https://dashboard.${domain}`,
        `https://app.${domain}`,
        `http://localhost:3000`,
        `http://localhost:5173`,
      ];
    } catch {
      // If BASE_URL is not a valid URL, allow all
    }
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  });

  console.log(`🔒 CORS allowed origins: ${JSON.stringify(allowedOrigins)}`);

  app.setGlobalPrefix('api/v1', {
    exclude: ['/', '/health', '/health/{*path}', '/mcp', '/dashboard', '/dashboard/{*path}'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const swaggerUser = configService.get<string>('SWAGGER_USER');
  const swaggerPassword = configService.get<string>('SWAGGER_PASSWORD');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Memory MCP Server API')
    .setDescription('REST Management API for Memory MCP Server')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Protect Swagger docs with Basic Auth if credentials are configured
  if (swaggerUser && swaggerPassword) {
    app.use('/api/docs', (req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Basic ')) {
        res.set('WWW-Authenticate', 'Basic realm="Swagger Docs"');
        return res.status(401).send('Authentication required');
      }
      const base64Credentials = auth.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      if (username !== swaggerUser || password !== swaggerPassword) {
        res.set('WWW-Authenticate', 'Basic realm="Swagger Docs"');
        return res.status(401).send('Invalid credentials');
      }
      next();
    });
  }

  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  const baseUrl = configService.get<string>('BASE_URL') || `http://localhost:${port}`;

  console.log(`\n🚀 Memory MCP Server is running!`);
  console.log(`📡 API Base URL: ${baseUrl}/api/v1`);
  console.log(`📚 Swagger Docs: ${baseUrl}/api/docs`);
  if (swaggerUser && swaggerPassword) {
    console.log(`🔒 Swagger Auth: Enabled (user: ${swaggerUser})`);
  }
  console.log('');
}
bootstrap();
