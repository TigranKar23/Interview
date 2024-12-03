import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new todo item for a user.
   * @param userId - ID of the user
   * @param title - Title of the todo
   * @returns Created Todo object
   */
  async createTodo(userId: number, title: string) {
    if (!title.trim()) {
      throw new BadRequestException('Title cannot be empty');
    }

    try {
      return await this.prisma.todo.create({
        data: { title, userId },
      });
    } catch (error) {
      throw new BadRequestException('Error creating todo');
    }
  }

  /**
   * List all todo items for a user.
   * @param userId - ID of the user
   * @returns Array of Todos
   */
  async listTodos(userId: number) {
    try {
      const todos = await this.prisma.todo.findMany({ where: { userId } });

      if (todos.length === 0) {
        throw new NotFoundException('No todos found for this user');
      }

      return todos;
    } catch (error) {
      throw new BadRequestException('Error retrieving todos');
    }
  }
}
