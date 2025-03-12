import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertSyllabusSchema, insertTodoSchema } from "@shared/schema";
import { generateRecommendations, generateSchedule, searchJobs, chatWithAI } from "./services/openai";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Update the syllabus upload route
  app.post("/api/syllabi", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Try to safely convert buffer to string, checking for encoding issues
      let content;
      try {
        // First try to decode as UTF-8
        content = req.file.buffer.toString('utf-8');

        // Check if the content is actually readable text
        if (content.includes('\0') || !/^[\x00-\x7F\u0080-\uFFFF]*$/.test(content)) {
          throw new Error('File contains binary or invalid characters');
        }
      } catch (error) {
        console.error("Content encoding error:", error);
        return res.status(400).json({ message: "Invalid file format. Please upload a text file." });
      }

      const parsedContent = await processSyllabus(content, req.file.originalname);

      const syllabus = await storage.createSyllabus({
        userId: 1, // Mock user ID for now
        filename: req.file.originalname,
        content,
        parsedContent,
      });

      res.json(syllabus);
    } catch (error) {
      console.error("Syllabus upload error:", error);
      res.status(500).json({ 
        message: "Failed to process syllabus",
        details: error instanceof Error ? error.message : undefined
      });
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
      const { message, syllabusId } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      let syllabus;
      if (syllabusId) {
        syllabus = await storage.getSyllabus(syllabusId);
        if (!syllabus) {
          return res.status(404).json({ message: "Syllabus not found" });
        }
      }

      const response = await chatWithAI(message, syllabus);
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

async function processSyllabus(content: string, filename: string) {
  try {
    // Create a structured object from the syllabus content
    const assignments = extractAssignments(content);
    const deadlines = extractDeadlines(content);

    return {
      assignments,
      deadlines,
      courseInfo: {
        name: extractCourseName(content) || filename,
        instructor: extractInstructor(content) || "",
        schedule: extractSchedule(content) || "",
      }
    };
  } catch (error) {
    console.error("Error processing syllabus:", error);
    throw new Error(`Failed to process syllabus content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions to extract information from syllabus content
function extractAssignments(content: string): string[] {
  const assignments: string[] = [];
  const lines = content.split('\n');

  // Keywords that indicate actual assignments
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

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    // Check if line contains assignment keywords and looks like a task
    if (
      assignmentKeywords.some(keyword => lowerLine.includes(keyword)) &&
      // Filter out lines that are too short or look like headers
      line.length > 10 &&
      !lowerLine.match(/^(chapter|week|unit|module|page|reading|lecture)/i) &&
      // Has some form of date or number
      (line.match(/\d/) || line.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i))
    ) {
      assignments.push(line.trim());
    }
  }

  return assignments;
}

function extractDeadlines(content: string): Array<{ task: string; date: string }> {
  const deadlines: Array<{ task: string; date: string }> = [];
  const currentYear = new Date().getFullYear();

  // Comprehensive date patterns
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    /\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](20\d{2})\b/,
    // Month DD, YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(20\d{2})\b/i,
  ];

  const lines = content.split('\n');
  for (const line of lines) {
    // Skip lines that don't look like assignments
    if (
      line.length < 10 ||
      line.toLowerCase().match(/^(chapter|week|unit|module|page|reading|lecture)/i)
    ) {
      continue;
    }

    for (const pattern of datePatterns) {
      const dateMatch = line.match(pattern);
      if (dateMatch) {
        let dateStr = dateMatch[0];
        let date = new Date(dateStr);

        // If date is valid and in a reasonable range
        if (
          !isNaN(date.getTime()) &&
          date.getFullYear() >= currentYear &&
          date.getFullYear() <= currentYear + 1
        ) {
          deadlines.push({
            task: line.trim(),
            date: date.toISOString().split('T')[0] // Format as YYYY-MM-DD
          });
          break;
        }
      }
    }
  }

  // Sort by date
  return deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function extractCourseName(content: string): string {
  const lines = content.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('course') && line.includes(':')) {
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
      !inScheduleSection &&
      (lowerLine.includes('schedule') ||
       lowerLine.includes('course outline') ||
       lowerLine.includes('weekly topics'))
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