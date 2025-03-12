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
    payRange?: string;
    matchingSkills?: string[];
  }>;
}

interface UserProfile {
  interests: string[];
  skills: string[];
  city: string;
  state: string;
}

export async function generateRecommendations(syllabus: Syllabus): Promise<RecommendationResponse> {
  const prompt = `Based on this course syllabus with filename "${syllabus.filename}", suggest relevant books and YouTube videos.
  Include 3 books and 3 videos that would help a student succeed in this course.
  Respond in JSON format with two arrays: 'books' (with title and description) and 'videos' (with title and url).`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user" as const, content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateSchedule(syllabus: Syllabus): Promise<ScheduleResponse> {
  try {
    const parsedContent = syllabus.parsedContent as { deadlines: Array<{ task: string; date: string }> };
    const currentDate = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(currentDate.getDate() + 14);

    const prompt = `Generate a focused academic schedule based on these assignments and deadlines:

Assignments and Deadlines:
${parsedContent.deadlines.map(d => `- ${d.task} (Due: ${d.date})`).join('\n')}

Requirements:
1. Focus ONLY on actual assignments, deadlines, and required submissions
2. Exclude general course information or readings unless directly related to an assignment
3. Use these specific date ranges:
   - High priority: Due within 7 days (${currentDate.toISOString().split('T')[0]} to ${new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})
   - Medium priority: Due within 8-14 days
   - Low priority: Due after 14 days
4. Break down large assignments into smaller tasks

Respond in JSON format with an array of 'tasks'. Each task must include:
- task: specific, actionable description
- dueDate: actual due date in YYYY-MM-DD format
- priority: "high"/"medium"/"low" based on due date

Only include real assignments with actual deadlines from the syllabus.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user" as const, content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(response.choices[0].message.content || "{}");
    if (!parsedResponse.tasks) {
      return { tasks: [] };
    }

    // Validate and filter tasks
    parsedResponse.tasks = parsedResponse.tasks
      .filter((task: any) => {
        const dueDate = new Date(task.dueDate);
        return !isNaN(dueDate.getTime()) && // Valid date
               dueDate >= currentDate && // Not in the past
               task.task.length > 10; // Meaningful task description
      })
      .sort((a: any, b: any) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );

    return parsedResponse;
  } catch (error) {
    console.error("Schedule generation error:", error);
    throw error;
  }
}

export async function searchJobs(query: string, profile: UserProfile): Promise<JobResponse> {
  const prompt = `Find relevant part-time jobs or gigs for a college student with the following profile:

Location: ${profile.city}, ${profile.state}
Interests: ${profile.interests.join(', ')}
Skills: ${profile.skills.join(', ')}

Additional search criteria: "${query}"

Focus on flexible, student-friendly opportunities that match their location, interests, and skills.
Respond in JSON format with an array of 'jobs' containing:
- title: job title
- description: detailed description
- type: "part-time" or "gig"
- location: city, state
- payRange: estimated pay range (optional)
- matchingSkills: array of skills from their profile that match the job (optional)`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user" as const, content: prompt }],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function chatWithAI(message: string, syllabus?: Syllabus): Promise<string> {
  const systemPrompt = "You are a helpful academic assistant for ASU students. " + 
    "Provide concise, relevant answers to help students with their academic needs.";

  const messages = [
    { role: "system" as const, content: systemPrompt },
  ];

  if (syllabus) {
    messages.push({
      role: "system" as const,
      content: `Here is the course syllabus content to reference:\n${syllabus.content}\n\nParsed syllabus information:\n${JSON.stringify(syllabus.parsedContent, null, 2)}`
    });
  }

  messages.push({ role: "user" as const, content: message });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
  });

  return response.choices[0].message.content || "I'm sorry, I couldn't process that request.";
}