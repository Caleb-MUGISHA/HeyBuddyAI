import { Syllabus, InsertSyllabus, Todo, InsertTodo } from "@shared/schema";

export interface IStorage {
  // Syllabus operations
  getSyllabus(id: number): Promise<Syllabus | undefined>;
  getUserSyllabi(userId: number): Promise<Syllabus[]>;
  createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus>;
  
  // Todo operations
  getTodos(userId: number): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, completed: boolean): Promise<Todo | undefined>;
}

export class MemStorage implements IStorage {
  private syllabi: Map<number, Syllabus>;
  private todos: Map<number, Todo>;
  private syllabusId: number;
  private todoId: number;

  constructor() {
    this.syllabi = new Map();
    this.todos = new Map();
    this.syllabusId = 1;
    this.todoId = 1;
  }

  async getSyllabus(id: number): Promise<Syllabus | undefined> {
    return this.syllabi.get(id);
  }

  async getUserSyllabi(userId: number): Promise<Syllabus[]> {
    return Array.from(this.syllabi.values()).filter(s => s.userId === userId);
  }

  async createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus> {
    const id = this.syllabusId++;
    const newSyllabus: Syllabus = {
      ...syllabus,
      id,
      uploadedAt: new Date(),
    };
    this.syllabi.set(id, newSyllabus);
    return newSyllabus;
  }

  async getTodos(userId: number): Promise<Todo[]> {
    return Array.from(this.todos.values()).filter(t => t.userId === userId);
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const id = this.todoId++;
    const newTodo: Todo = { ...todo, id };
    this.todos.set(id, newTodo);
    return newTodo;
  }

  async updateTodo(id: number, completed: boolean): Promise<Todo | undefined> {
    const todo = this.todos.get(id);
    if (!todo) return undefined;
    const updatedTodo = { ...todo, completed: completed ? 1 : 0 };
    this.todos.set(id, updatedTodo);
    return updatedTodo;
  }
}

export const storage = new MemStorage();
