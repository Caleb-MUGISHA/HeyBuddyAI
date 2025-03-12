import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const syllabi = pgTable("syllabi", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  parsedContent: jsonb("parsed_content").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  syllabusId: integer("syllabus_id").notNull(),
  task: text("task").notNull(),
  dueDate: timestamp("due_date").notNull(),
  completed: integer("completed").default(0),
});

export const insertSyllabusSchema = createInsertSchema(syllabi).omit({
  id: true,
  uploadedAt: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
});

export type InsertSyllabus = z.infer<typeof insertSyllabusSchema>;
export type Syllabus = typeof syllabi.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
