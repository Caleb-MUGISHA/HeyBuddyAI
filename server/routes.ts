import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertSyllabusSchema, insertTodoSchema } from "@shared/schema";
import { generateRecommendations, generateSchedule, searchJobs, chatWithAI } from "./services/openai";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Existing syllabus upload route
  app.post("/api/syllabi", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert binary content to base64 to store safely
      const content = req.file.buffer.toString('base64');

      const parsedContent = await processSyllabus(req.file);

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

  // AI-powered recommendations route
  app.get("/api/recommendations/:syllabusId", async (req, res) => {
    try {
      const syllabus = await storage.getSyllabus(parseInt(req.params.syllabusId));
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus not found" });
      }

      const recommendations = await generateRecommendations(syllabus);
      res.json(recommendations);
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // AI-powered schedule generation route
  app.get("/api/schedule/:syllabusId", async (req, res) => {
    try {
      const syllabus = await storage.getSyllabus(parseInt(req.params.syllabusId));
      if (!syllabus) {
        return res.status(404).json({ message: "Syllabus not found" });
      }

      const schedule = await generateSchedule(syllabus);
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

  // Existing routes...
  app.get("/api/syllabi", async (req, res) => {
    try {
      const syllabi = await storage.getUserSyllabi(1); // Mock user ID
      res.json(syllabi);
    } catch (error) {
      console.error("Get syllabi error:", error);
      res.status(500).json({ message: "Failed to fetch syllabi" });
    }
  });

  // Todo routes remain the same...
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

async function processSyllabus(file: Express.Multer.File) {
  try {
    // Decode and parse the content
    const content = file.buffer.toString('utf-8');

    // Create a structured object from the syllabus content
    const parsedContent = {
      assignments: extractAssignments(content),
      deadlines: extractDeadlines(content),
      courseInfo: {
        name: extractCourseName(content) || file.originalname,
        instructor: extractInstructor(content) || "",
        schedule: extractSchedule(content) || "",
      }
    };

    return parsedContent;
  } catch (error) {
    console.error("Error processing syllabus:", error);
    throw new Error("Failed to process syllabus content");
  }
}

// Helper functions to extract information from syllabus content
function extractAssignments(content: string): string[] {
  const assignments: string[] = [];

  // Look for common assignment indicators
  const lines = content.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('assignment') ||
      lowerLine.includes('homework') ||
      lowerLine.includes('project') ||
      lowerLine.includes('quiz') ||
      lowerLine.includes('exam')
    ) {
      assignments.push(line.trim());
    }
  }

  return assignments;
}

function extractDeadlines(content: string): Array<{ task: string; date: string }> {
  const deadlines: Array<{ task: string; date: string }> = [];
  const datePattern = /(\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b)|(\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b)/gi;

  const lines = content.split('\n');
  for (const line of lines) {
    const dates = line.match(datePattern);
    if (dates) {
      deadlines.push({
        task: line.trim(),
        date: dates[0]
      });
    }
  }

  return deadlines;
}

function extractCourseName(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('course') && line.includes(':')) {
      return line.split(':')[1].trim();
    }
  }
  return "";
}

function extractInstructor(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      (lowerLine.includes('instructor') || lowerLine.includes('professor')) &&
      line.includes(':')
    ) {
      return line.split(':')[1].trim();
    }
  }
  return "";
}

function extractSchedule(content: string): string {
  const scheduleSection: string[] = [];
  let inScheduleSection = false;

  const lines = content.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('schedule') ||
      lowerLine.includes('course outline') ||
      lowerLine.includes('weekly topics')
    ) {
      inScheduleSection = true;
      continue;
    }

    if (inScheduleSection && line.trim()) {
      scheduleSection.push(line.trim());
    }

    // Stop if we hit another major section
    if (
      inScheduleSection &&
      (lowerLine.includes('grading') ||
       lowerLine.includes('policies') ||
       lowerLine.includes('materials'))
    ) {
      break;
    }
  }

  return scheduleSection.join('\n');
}