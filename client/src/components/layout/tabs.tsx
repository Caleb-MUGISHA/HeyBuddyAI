import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyllabusUpload } from "../features/syllabus-upload";
import { Schedule } from "../features/schedule";
import { Recommendations } from "../features/recommendations";
import { Search } from "../features/search";
import { Chat } from "../features/chat";
import { MotivationDashboard } from "../features/motivation-dashboard";
import { useState } from "react";
import { Trophy } from "lucide-react";

export function TabsContainer() {
  const [currentSyllabusId, setCurrentSyllabusId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const handleSyllabusUpload = (syllabusId: number) => {
    setCurrentSyllabusId(syllabusId);
    setActiveTab("schedule"); // Automatically switch to schedule tab
  };

  return (
    <TabsRoot value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-2 transition-all duration-300">
        <TabsTrigger 
          value="upload" 
          className="transition-all duration-300 data-[state=active]:scale-[0.97]"
        >
          Upload Syllabus
        </TabsTrigger>
        <TabsTrigger 
          value="schedule"
          className="transition-all duration-300 data-[state=active]:scale-[0.97]"
        >
          Schedule
        </TabsTrigger>
        <TabsTrigger 
          value="recommendations"
          className="transition-all duration-300 data-[state=active]:scale-[0.97]"
        >
          Recommendations
        </TabsTrigger>
        <TabsTrigger 
          value="search"
          className="transition-all duration-300 data-[state=active]:scale-[0.97]"
        >
          Search
        </TabsTrigger>
        <TabsTrigger 
          value="chat"
          className="transition-all duration-300 data-[state=active]:scale-[0.97]"
        >
          Chat
        </TabsTrigger>
        <TabsTrigger 
          value="motivation"
          className="transition-all duration-300 data-[state=active]:scale-[0.97]"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Motivation
        </TabsTrigger>
      </TabsList>

      <div className="p-2 sm:p-4 transition-all duration-300">
        <TabsContent value="upload" className="mt-0 transition-all duration-300">
          <SyllabusUpload onUploadSuccess={handleSyllabusUpload} />
        </TabsContent>

        <TabsContent value="schedule" className="mt-0 transition-all duration-300">
          <Schedule syllabusId={currentSyllabusId} />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0 transition-all duration-300">
          <Recommendations syllabusId={currentSyllabusId} />
        </TabsContent>

        <TabsContent value="search" className="mt-0 transition-all duration-300">
          <Search />
        </TabsContent>

        <TabsContent value="chat" className="mt-0 transition-all duration-300">
          <Chat syllabusId={currentSyllabusId} />
        </TabsContent>

        <TabsContent value="motivation" className="mt-0 transition-all duration-300">
          <MotivationDashboard />
        </TabsContent>
      </div>
    </TabsRoot>
  );
}