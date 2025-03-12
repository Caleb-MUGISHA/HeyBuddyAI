import { Syllabus, InsertSyllabus, Todo, InsertTodo, syllabi, todos } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getSyllabus(id: number): Promise<Syllabus | undefined> {
    const [syllabus] = await db.select().from(syllabi).where(eq(syllabi.id, id));
    return syllabus;
  }

  async getUserSyllabi(userId: number): Promise<Syllabus[]> {
    return db.select().from(syllabi).where(eq(syllabi.userId, userId));
  }

  async createSyllabus(syllabus: InsertSyllabus): Promise<Syllabus> {
    const [newSyllabus] = await db.insert(syllabi).values(syllabus).returning();
    return newSyllabus;
  }

  async getTodos(userId: number): Promise<Todo[]> {
    return db.select().from(todos).where(eq(todos.userId, userId));
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [newTodo] = await db.insert(todos).values(todo).returning();
    return newTodo;
  }

  async updateTodo(id: number, completed: boolean): Promise<Todo | undefined> {
    const [updatedTodo] = await db
      .update(todos)
      .set({ completed: completed ? 1 : 0 })
      .where(eq(todos.id, id))
      .returning();
    return updatedTodo;
  }
}

export const storage = new DatabaseStorage();