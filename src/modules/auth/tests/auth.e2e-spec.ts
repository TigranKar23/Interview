import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/register (POST)', async () => {
    const uniqueEmail = `test+${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: uniqueEmail, password: 'password' })
      .expect(201) // Исправлено на 201
      .expect((res) => {
        expect(res.body.data.email).toEqual(uniqueEmail);
      });
  });

  it('/auth/login (POST)', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200)
      .expect((res) => {
        // Adjust to check within the "data" field
        expect(res.body.data.accessToken).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
