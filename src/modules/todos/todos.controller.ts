import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create.dto';
import { JwtAuthGuard } from '../../common/middleware/jwt-auth.middleware';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createTodoDto: CreateTodoDto, @Req() req) {
    const { title } = createTodoDto;

    if (!req.user?.id) {
      throw new BadRequestException('Invalid user');
    }

    return this.todosService.createTodo(req.user.id, title);
  }

  @Get()
  async list(@Req() req) {
    if (!req.user?.id) {
      throw new BadRequestException('Invalid user');
    }

    const todos = await this.todosService.listTodos(req.user.id);
    return { message: 'Todos fetched successfully', data: todos };
  }
}
