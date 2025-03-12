import { TabsContainer } from "@/components/layout/tabs";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white">Hey Buddy</h1>
          <p className="text-primary-foreground/80 mt-2">
            Your AI-powered ASU Assistant
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mt-6">
          <TabsContainer />
        </Card>
      </main>
    </div>
  );
}