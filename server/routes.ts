import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertSyllabusSchema, insertTodoSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Syllabus routes
  app.post("/api/syllabi", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let content: string;
      try {
        content = req.file.buffer.toString("utf-8");
      } catch (error) {
        return res.status(400).json({ message: "Invalid file format" });
      }

      const parsedContent = await processSyllabus(content);

      const syllabus = await storage.createSyllabus({
        userId: 1, // Mock user ID for now
        filename: req.file.originalname,
        content,
        parsedContent,
      });

      res.json(syllabus);
    } catch (error) {
      console.error("Syllabus upload error:", error);
      res.status(500).json({ message: "Failed to process syllabus" });
    }
  });

  app.get("/api/syllabi", async (req, res) => {
    try {
      const syllabi = await storage.getUserSyllabi(1); // Mock user ID
      res.json(syllabi);
    } catch (error) {
      console.error("Get syllabi error:", error);
      res.status(500).json({ message: "Failed to fetch syllabi" });
    }
  });

  // Todo routes
  app.get("/api/todos", async (req, res) => {
    try {
      const todos = await storage.getTodos(1); // Mock user ID
      res.json(todos);
    } catch (error) {
      console.error("Get todos error:", error);
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", async (req, res) => {
    try {
      const todo = insertTodoSchema.parse(req.body);
      const created = await storage.createTodo(todo);
      res.json(created);
    } catch (error) {
      console.error("Create todo error:", error);
      res.status(400).json({ message: "Invalid todo data" });
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completed = req.body.completed;
      const updated = await storage.updateTodo(id, completed);
      if (!updated) {
        res.status(404).json({ message: "Todo not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      console.error("Update todo error:", error);
      res.status(500).json({ message: "Failed to update todo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processSyllabus(content: string) {
  // Basic syllabus processing
  return {
    assignments: [],
    deadlines: [],
    courseInfo: {
      name: "",
      instructor: "",
      schedule: "",
    }
  };
}