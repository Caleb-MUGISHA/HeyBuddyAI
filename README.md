# Agentic Web Application - AI-Powered Student Assistant

## **Overview**

This is an AI-powered student assistant application designed specifically for **Arizona State University (ASU) students**. It helps manage academic tasks, process syllabi, and provide personalized study support through an intelligent **Single AI Agent**.

## **Tech Stack**

### **Frontend:**

- React with TypeScript for the UI
- Wouter for lightweight routing
- TanStack Query (React Query) for data fetching and caching
- Framer Motion for smooth animations
- Shadcn UI components with Tailwind CSS for styling
- Lucide React for icons

### **Backend:**

- Node.js with Express for the server
- Drizzle ORM for database management
- Multer for file uploads
- OpenAI API (GPT-4o) for AI capabilities
- PostgreSQL for data storage

## **Core Architecture & Features**

### **1. Perception Layer**

Handles user inputs and syllabus processing with context awareness.

- **User Input:** Text, file uploads (syllabus), and voice commands.
- **Context Awareness:** Detects user-specific needs and course-related details.
- **Syllabus Processing:** Extracts key dates, assignments, and course structure.

### **2. Cognition Layer**

AI-driven decision-making and task prioritization.

- **LLM Core (GPT-4o):** Processes user queries, syllabus data, and study recommendations.
- **Memory & Context Storage:** Uses **Vector Database (Pinecone/Weaviate)** to retain historical context.
- **Task Prioritization System:** Organizes study schedules and task urgencies based on deadlines.

### **3. Action Layer**

Automates user tasks and provides actionable outputs.

- **API Integrations:** Google Calendar (study schedules), LinkedIn/Handshake (job searches), YouTube/Coursera (learning resources).
- **Automated Notifications & Updates:** Sends reminders for assignments, exams, and job opportunities.

## **Deployment & Development Workflow**

### **Deployment**

- **Backend:** AWS/GCP/Vercel
- **Database:** AWS RDS/Supabase (PostgreSQL)
- **Frontend:** Vercel/Netlify

### **Development Workflow**

- **Version Control:** GitHub/GitLab with CI/CD
- **Code Quality:** ESLint, Prettier


## **Challenges Faced**

### **1. Integration & Complexity**

- Managing multiple frontend and backend technologies while ensuring smooth data flow.
- Maintaining consistent real-time interactions across the system.

### **2. AI Agent Development & Context Management**

- Handling syllabus parsing and task prioritization effectively.
- Implementing memory retention for personalized responses.

### **3. Scalability & Security**

- Ensuring smooth performance when processing large academic data.
- Implementing **secure authentication (OAuth/JWT)** and encrypted storage.

## **Future Enhancements**

- **Advanced AI automation:** Adaptive learning paths, auto-rescheduling of tasks.
- **Voice command integration:** Enabling hands-free interaction.
- **Real-time collaboration:** Study groups, shared notes, and interactive Q&A.

## **Getting Started**

### **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/agentic-web-app.git
   cd agentic-web-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env` file:
   ```env
   OPENAI_API_KEY=your_api_key
   DATABASE_URL=your_postgres_url
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## **Contributing**

We welcome contributions! Please submit pull requests, report issues, or suggest improvements.

## **License**

This project is licensed under the MIT License.

---

This README provides a **comprehensive** overview of the project, including system design, deployment, challenges, and setup instructions.
