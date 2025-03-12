import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyllabusUpload } from "../features/syllabus-upload";
import { Schedule } from "../features/schedule";
import { Recommendations } from "../features/recommendations";
import { Search } from "../features/search";
import { Chat } from "../features/chat";
import { useState } from "react";

export function TabsContainer() {
  const [currentSyllabusId, setCurrentSyllabusId] = useState<number | null>(null);

  return (
    <TabsRoot defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-2 transition-all duration-300">
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
      </TabsList>

      <div className="p-2 sm:p-4 transition-all duration-300">
        <TabsContent value="upload" className="mt-0 transition-all duration-300">
          <SyllabusUpload onUploadSuccess={setCurrentSyllabusId} />
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
          <Chat />
        </TabsContent>
      </div>
    </TabsRoot>
  );
}