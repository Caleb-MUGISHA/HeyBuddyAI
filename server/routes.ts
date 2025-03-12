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

      // Convert the buffer to text content
      const content = req.file.buffer.toString('utf-8');
      console.log("Processing syllabus content:", content.substring(0, 200) + "..."); // Log first 200 chars

      const parsedContent = await processSyllabus(req.file);
      console.log("Parsed syllabus content:", JSON.stringify(parsedContent, null, 2));

      const syllabus = await storage.createSyllabus({
        userId: 1, // Mock user ID for now
        filename: req.file.originalname,
        content: content, // Store as plain text instead of base64
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

      console.log("Retrieved syllabus:", JSON.stringify(syllabus, null, 2));

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
    // Parse the content
    const content = file.buffer.toString('utf-8');

    // Extract assignments with dates
    const assignmentsWithDates = extractAssignmentsWithDates(content);
    console.log("Extracted assignments:", assignmentsWithDates);

    return {
      assignments: assignmentsWithDates.map(a => a.task),
      deadlines: assignmentsWithDates,
      courseInfo: {
        name: extractCourseName(content) || file.originalname,
        instructor: extractInstructor(content) || "",
        schedule: extractSchedule(content) || "",
      }
    };
  } catch (error) {
    console.error("Error processing syllabus:", error);
    throw new Error("Failed to process syllabus content");
  }
}

function extractAssignmentsWithDates(content: string): Array<{ task: string; date: string }> {
  const assignments: Array<{ task: string; date: string }> = [];
  const currentYear = new Date().getFullYear();

  // Date patterns
  const datePatterns = [
    /\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](20\d{2})\b/, // MM/DD/YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(?:20\d{2})?\b/i, // Month DD, YYYY
  ];

  // Keywords that indicate assignments
  const assignmentKeywords = [
    'assignment',
    'homework',
    'project',
    'quiz',
    'exam',
    'paper',
    'presentation',
    'due',
    'submit',
    'deadline'
  ];

  const lines = content.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Skip headers and short lines
    if (line.length < 10 || lowerLine.match(/^(chapter|week|unit|module|page|reading|lecture)/i)) {
      continue;
    }

    // Check if line contains assignment keywords
    if (assignmentKeywords.some(keyword => lowerLine.includes(keyword))) {
      // Look for dates in the line
      for (const pattern of datePatterns) {
        const dateMatch = line.match(pattern);
        if (dateMatch) {
          let dateStr = dateMatch[0];
          // Add current year if year is missing
          if (!dateStr.match(/20\d{2}/)) {
            dateStr = `${dateStr}, ${currentYear}`;
          }

          const date = new Date(dateStr);

          // Validate date
          if (!isNaN(date.getTime())) {
            assignments.push({
              task: line.trim(),
              date: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
            });
            break;
          }
        }
      }
    }
  }

  return assignments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function extractCourseName(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      (lowerLine.includes('course') || lowerLine.includes('class')) &&
      line.includes(':')
    ) {
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
      (lowerLine.includes('instructor') || 
       lowerLine.includes('professor') || 
       lowerLine.includes('taught by')) &&
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

    // Start of schedule section
    if (
      !inScheduleSection &&
      (lowerLine.includes('schedule') ||
       lowerLine.includes('course outline') ||
       lowerLine.includes('weekly topics') ||
       lowerLine.includes('course calendar'))
    ) {
      inScheduleSection = true;
      continue;
    }

    // Add non-empty lines while in schedule section
    if (inScheduleSection && line.trim()) {
      scheduleSection.push(line.trim());
    }

    // End of schedule section
    if (
      inScheduleSection &&
      (lowerLine.includes('grading') ||
       lowerLine.includes('policies') ||
       lowerLine.includes('materials') ||
       lowerLine.includes('requirements'))
    ) {
      break;
    }
  }

  return scheduleSection.join('\n');
}