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
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
        <TabsTrigger value="upload">Upload Syllabus</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        <TabsTrigger value="search">Search</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <SyllabusUpload onUploadSuccess={setCurrentSyllabusId} />
      </TabsContent>

      <TabsContent value="schedule">
        <Schedule syllabusId={currentSyllabusId} />
      </TabsContent>

      <TabsContent value="recommendations">
        <Recommendations syllabusId={currentSyllabusId} />
      </TabsContent>

      <TabsContent value="search">
        <Search />
      </TabsContent>

      <TabsContent value="chat">
        <Chat />
      </TabsContent>
    </TabsRoot>
  );
}