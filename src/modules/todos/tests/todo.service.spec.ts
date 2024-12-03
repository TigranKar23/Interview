import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from '../todos.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TodosService', () => {
  let todosService: TodosService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    todosService = module.get<TodosService>(TodosService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should create a todo', async () => {
    const mockTodo = { id: 1, title: 'Test Todo', userId: 1, completed: false };
    prismaService.todo.create.mockResolvedValue(mockTodo);

    const result = await todosService.createTodo(1, 'Test Todo');
    expect(prismaService.todo.create).toHaveBeenCalledWith({
      data: { title: 'Test Todo', userId: 1 },
    });
    expect(result).toEqual(mockTodo);
  });

  it('should list todos for a user', async () => {
    const mockTodos = [
      { id: 1, title: 'Test Todo 1', userId: 1, completed: false },
      { id: 2, title: 'Test Todo 2', userId: 1, completed: false },
    ];
    prismaService.todo.findMany.mockResolvedValue(mockTodos);

    const result = await todosService.listTodos(1);
    expect(prismaService.todo.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(result).toEqual(mockTodos);
  });
});
