import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertSyllabusSchema, insertTodoSchema } from "@shared/schema";
import { generateRecommendations, generateSchedule, searchJobs, chatWithAI } from "./services/openai";
import { Buffer } from 'buffer';

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Syllabus upload route
  app.post("/api/syllabi", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Basic content extraction - store as base64 for now
      const content = req.file.buffer.toString('base64');
      console.log("Processing file:", req.file.originalname);
      console.log("File size:", req.file.size, "bytes");
      console.log("MIME type:", req.file.mimetype);

      // For now, create a simple structure with the file content
      const parsedContent = {
        assignments: [],
        deadlines: [
          {
            task: "Example Assignment 1",
            date: "2025-03-19" // One week from today
          },
          {
            task: "Example Assignment 2",
            date: "2025-03-26" // Two weeks from today
          }
        ],
        courseInfo: {
          name: req.file.originalname,
          instructor: "TBD",
          schedule: "TBD"
        }
      };

      const syllabus = await storage.createSyllabus({
        userId: 1, // Mock user ID for now
        filename: req.file.originalname,
        content: content,
        parsedContent,
      });

      res.json(syllabus);
    } catch (error) {
      console.error("Syllabus upload error:", error);
      res.status(500).json({ message: "Failed to process syllabus" });
    }
  });

  // AI-powered schedule generation route
  app.get("/api/schedule/:syllabusId", async (req, res) => {
    try {
      const syllabus = await storage.getSyllabus(parseInt(req.params.syllabusId));
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus not found" });
      }

      console.log("Retrieved syllabus:", syllabus.filename);
      const schedule = await generateSchedule(syllabus);
      console.log("Generated schedule:", JSON.stringify(schedule, null, 2));

      res.json(schedule);
    } catch (error) {
      console.error("Schedule generation error:", error);
      res.status(500).json({ message: "Failed to generate schedule" });
    }
  });

  // AI-powered job search route
  app.post("/api/search/jobs", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const jobs = await searchJobs(query);
      res.json(jobs);
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  // AI chat route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await chatWithAI(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Get all syllabi
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