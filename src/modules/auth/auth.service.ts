import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new Error('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    console.log('Hashed password:', hashedPassword);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id };
    const secretKey = process.env.JWT_SECRET || 'default_secret_key';
    const accessToken = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    return { accessToken };
  }
}
