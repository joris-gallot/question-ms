// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv-expand')(require('dotenv').config());
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL],
        queue: 'question_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  app.listen();

  (await NestFactory.create(AppModule)).listen(process.env.PORT);
}
bootstrap();
