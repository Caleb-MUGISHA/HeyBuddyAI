import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Book, Video, Loader2 } from "lucide-react";

interface Recommendation {
  books: Array<{ title: string; description: string }>;
  videos: Array<{ title: string; url: string }>;
}

interface Props {
  syllabusId: number | null;
}

export function Recommendations({ syllabusId }: Props) {
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery<Recommendation>({
    queryKey: [`/api/recommendations/${syllabusId}`],
    enabled: !!syllabusId,
    retry: false,
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load recommendations",
        variant: "destructive",
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {!syllabusId ? (
            <div className="text-center text-muted-foreground p-4">
              Please upload a syllabus first to get recommendations.
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !recommendations?.books?.length && !recommendations?.videos?.length ? (
            <div className="text-center text-muted-foreground p-4">
              No recommendations found. Try uploading a different syllabus.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Recommended Books
                </h3>
                <div className="mt-3 space-y-4">
                  {recommendations?.books.map((book, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium">{book.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {book.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Recommended Videos
                </h3>
                <div className="mt-3 space-y-4">
                  {recommendations?.videos.map((video, index) => (
                    <div key={index} className="border-l-2 border-secondary pl-4">
                      <h4 className="font-medium">{video.title}</h4>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 block"
                      >
                        Watch Video
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}