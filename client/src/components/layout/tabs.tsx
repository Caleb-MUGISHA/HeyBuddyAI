import { Tabs as TabsRoot, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SyllabusUpload } from "../features/syllabus-upload";
import { Schedule } from "../features/schedule";
import { Recommendations } from "../features/recommendations";
import { Search } from "../features/search";
import { Chat } from "../features/chat";

export function TabsContainer() {
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
        <SyllabusUpload />
      </TabsContent>

      <TabsContent value="schedule">
        <Schedule />
      </TabsContent>

      <TabsContent value="recommendations">
        <Recommendations />
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