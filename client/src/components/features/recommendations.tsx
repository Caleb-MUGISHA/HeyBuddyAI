import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Recommendations() {
  const recommendations = [
    {
      type: "video",
      title: "Introduction to Course Topics",
      url: "https://example.com/video1",
    },
    {
      type: "resource",
      title: "Study Guide",
      url: "https://example.com/guide",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {recommendations.map((rec, index) => (
            <div key={index} className="py-2">
              <h3 className="font-medium">{rec.title}</h3>
              <p className="text-sm text-muted-foreground">{rec.type}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
