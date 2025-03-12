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

interface JobResponse {
  jobs: Array<{
    title: string;
    description: string;
    type: string;
    location: string;
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
    // Extract the parsed content
    const parsedContent = syllabus.parsedContent;

    // Create a more detailed prompt using the extracted information
    const prompt = `Based on this syllabus information:

Course: ${parsedContent.courseInfo.name}
Instructor: ${parsedContent.courseInfo.instructor}

Assignments:
${parsedContent.assignments.map(a => `- ${a}`).join('\n')}

Deadlines:
${parsedContent.deadlines.map(d => `- ${d.task} (${d.date})`).join('\n')}

Course Schedule:
${parsedContent.courseInfo.schedule}

Create a detailed weekly schedule for the next 2-3 weeks. For each task:
1. Use the actual assignment names and deadlines from the syllabus
2. Break down larger assignments into smaller, manageable tasks
3. Include preparation work and readings
4. Set appropriate priority levels based on due dates and task importance

Respond in JSON format with an array of 'tasks', each containing:
- task: detailed description of what needs to be done
- dueDate: specific date in ISO format (YYYY-MM-DD)
- priority: "high" for items due within a week, "medium" for 2 weeks, "low" for beyond

Focus on creating a practical and achievable schedule that helps students stay on track.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content || "{}");
    if (!parsedResponse.tasks) {
      return { tasks: [] };
    }

    // Sort tasks by due date
    parsedResponse.tasks.sort((a: any, b: any) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return parsedResponse;
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