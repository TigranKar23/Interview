import { Controller, Post, Body, BadRequestException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);
      return {
        statusCode: 201,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      console.log('Error during registration:', error.message);
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        statusCode: 200,
        message: 'User login successfully',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Login failed');
    }
  }
}
