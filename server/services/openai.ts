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

export async function generateSchedule(syllabus: Syllabus): Promise<ScheduleResponse> {
  try {
    const parsedContent = syllabus.parsedContent;
    const currentDate = new Date();

    // First, extract all the assignments and deadlines
    const assignments = parsedContent.deadlines;

    if (!assignments || assignments.length === 0) {
      console.log("No assignments found in syllabus");
      return { tasks: [] };
    }

    // Sort assignments by date
    assignments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Convert assignments into tasks with preparation steps
    const tasks = assignments.flatMap(assignment => {
      const dueDate = new Date(assignment.date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      // Determine the base priority
      const priority = daysUntilDue <= 7 ? "high" : daysUntilDue <= 14 ? "medium" : "low";

      // Create the main task
      const mainTask = {
        task: assignment.task,
        dueDate: assignment.date,
        priority
      };

      // For assignments due in more than 3 days, add preparation tasks
      const prepTasks = [];
      if (daysUntilDue > 3) {
        // Extract the core assignment type and name
        const taskLower = assignment.task.toLowerCase();
        if (taskLower.includes('exam') || taskLower.includes('quiz')) {
          // Add study preparation task 3 days before
          const prepDate = new Date(dueDate);
          prepDate.setDate(prepDate.getDate() - 3);
          prepTasks.push({
            task: `Prepare for: ${assignment.task}`,
            dueDate: prepDate.toISOString().split('T')[0],
            priority: "high"
          });
        } else if (taskLower.includes('project') || taskLower.includes('paper')) {
          // Add start task 7 days before for larger assignments
          const startDate = new Date(dueDate);
          startDate.setDate(startDate.getDate() - 7);
          prepTasks.push({
            task: `Start working on: ${assignment.task}`,
            dueDate: startDate.toISOString().split('T')[0],
            priority: "medium"
          });
        }
      }

      return [...prepTasks, mainTask];
    });

    // Final sort by date
    tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    console.log("Generated tasks:", JSON.stringify(tasks, null, 2));
    return { tasks };

  } catch (error) {
    console.error("Schedule generation error:", error);
    throw error;
  }
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