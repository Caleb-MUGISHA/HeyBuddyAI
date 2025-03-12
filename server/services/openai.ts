import OpenAI from "openai";
import { type Syllabus } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RecommendationResponse {
  books: Array<{ title: string; description: string }>;
  videos: Array<{ title: string; url: string }>;
}

interface ScheduleResponse {
  tasks: Array<{
    task: string;
    dueDate: string;
    priority: string;
  }>;
}

export async function generateRecommendations(syllabus: Syllabus): Promise<RecommendationResponse> {
  const prompt = `Based on this course syllabus with filename "${syllabus.filename}", suggest relevant books and YouTube videos.
  Include 3 books and 3 videos that would help a student succeed in this course.
  Respond in JSON format with two arrays: 'books' (with title and description) and 'videos' (with title and url).`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateSchedule(syllabus: Syllabus): Promise<ScheduleResponse> {
  try {
    const parsedContent = syllabus.parsedContent;
    const currentDate = new Date();

    // Convert deadlines directly into tasks without AI generation
    const tasks = parsedContent.deadlines.map(deadline => {
      const dueDate = new Date(deadline.date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      let priority = "low";
      if (daysUntilDue <= 7) {
        priority = "high";
      } else if (daysUntilDue <= 14) {
        priority = "medium";
      }

      return {
        task: deadline.task,
        dueDate: deadline.date,
        priority
      };
    }).filter(task => {
      const dueDate = new Date(task.dueDate);
      return !isNaN(dueDate.getTime()) && // Valid date
             dueDate >= currentDate; // Not in the past
    }).sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return { tasks };
  } catch (error) {
    console.error("Schedule generation error:", error);
    throw error;
  }
}

export async function searchJobs(query: string): Promise<JobResponse> {
  const prompt = `Find relevant part-time jobs or gigs for a college student interested in: "${query}".
  Focus on flexible, student-friendly opportunities.
  Respond in JSON format with an array of 'jobs' containing title, description, type (part-time/gig), and location.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

interface JobResponse {
  jobs: Array<{
    title: string;
    description: string;
    type: string;
    location: string;
  }>;
}

export async function chatWithAI(message: string, context?: string): Promise<string> {
  const systemPrompt = "You are a helpful academic assistant for ASU students. " + 
    "Provide concise, relevant answers to help students with their academic needs.";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      ...(context ? [{ role: "user", content: `Context: ${context}` }] : []),
      { role: "user", content: message }
    ]
  });

  return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
}