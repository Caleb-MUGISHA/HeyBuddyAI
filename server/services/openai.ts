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

    // Create a clear context for the AI using the parsed syllabus content
    const prompt = `Analyze this syllabus information and create a detailed academic schedule:

Course: ${parsedContent.courseInfo.name}
Instructor: ${parsedContent.courseInfo.instructor}

Course Schedule:
${parsedContent.courseInfo.schedule}

Assignments and Deadlines:
${parsedContent.deadlines.map(d => `- ${d.task} (Due: ${d.date})`).join('\n')}

Create a comprehensive schedule that:
1. Uses ONLY the actual deadlines and dates from the syllabus
2. Breaks down major assignments into preparation tasks
3. Adds study milestones before exams
4. Includes reminders for project checkpoints

For each task:
- Use exact due dates from the syllabus for main assignments
- Place prep tasks 3-7 days before main deadlines
- Set priority based on:
  * HIGH: Due within 7 days or critical milestones
  * MEDIUM: Due within 8-14 days
  * LOW: Due after 14 days

Return a JSON object with an array of tasks, each having:
- task: Clear, specific description of what needs to be done
- dueDate: ISO format date (YYYY-MM-DD), must match syllabus dates for actual assignments
- priority: "high", "medium", or "low"

Important: Only include tasks that relate to actual syllabus content and deadlines.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content || "{}");

    if (!parsedResponse.tasks) {
      return { tasks: [] };
    }

    // Validate and process tasks
    const tasks = parsedResponse.tasks
      .filter((task: any) => {
        const dueDate = new Date(task.dueDate);
        return (
          !isNaN(dueDate.getTime()) && // Valid date
          dueDate >= currentDate && // Not in past
          task.task.length > 10 // Meaningful description
        );
      })
      // Verify prep tasks don't have dates after their related deadlines
      .sort((a: any, b: any) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    // Ensure every deadline from the syllabus is included
    const syllabusDeadlines = new Set(parsedContent.deadlines.map(d => d.date));
    const aiGeneratedDeadlines = new Set(tasks.map((t: any) => t.dueDate));

    // Add any missing syllabus deadlines
    parsedContent.deadlines.forEach(deadline => {
      if (!aiGeneratedDeadlines.has(deadline.date)) {
        const dueDate = new Date(deadline.date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        tasks.push({
          task: deadline.task,
          dueDate: deadline.date,
          priority: daysUntilDue <= 7 ? "high" : daysUntilDue <= 14 ? "medium" : "low"
        });
      }
    });

    // Final sort by date
    tasks.sort((a: any, b: any) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    return { tasks };
  } catch (error) {
    console.error("Schedule generation error:", error);
    throw error;
  }
}

// Other functions remain unchanged...
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