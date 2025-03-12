import { TabsContainer } from "@/components/layout/tabs";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary py-4 sm:py-6 transition-all duration-300">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white transition-all duration-300">
            Your AI-Powered ASU Agent
          </h1>
          <p className="text-primary-foreground/90 mt-2 text-lg sm:text-xl font-medium transition-all duration-300">
            to help you Ace the semester.
          </p>
          <p className="text-primary-foreground/80 mt-2 text-sm sm:text-base transition-all duration-300">
            Never miss an assignment or exam deadline.
          </p>
          <p className="text-primary-foreground/80 mt-1 text-sm sm:text-base transition-all duration-300">
            Hey Buddy makes it simple; just upload your syllabus and watch us do the hard work for you
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8 transition-all duration-300">
        <Card className="mt-4 sm:mt-6 overflow-hidden">
          <TabsContainer />
        </Card>
      </main>
    </div>
  );
}