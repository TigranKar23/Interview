import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { HttpException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('should create a new user with a hashed password', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password' };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: 1,
        email: createUserDto.email,
        password: 'hashed-password',
      });

      console.log('Calling register for the first time');
      const result = await authService.register(createUserDto);
      console.log('Result from register:', result);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should throw an error if email already exists', async () => {
      const createUserDto = { email: 'duplicate@example.com', password: 'password' };

      jest.spyOn(prismaService.user, 'create').mockRejectedValue({
        code: 'P2002',
      });

      await expect(authService.register(createUserDto)).rejects.toThrow(
        new HttpException('Email already exists', 409),
      );
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = {
        id: 1,
        email: loginDto.email,
        password: 'hashed-password',
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        'hashed-password',
      );
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong-password' };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
      });

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
