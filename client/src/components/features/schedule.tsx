import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";

interface ScheduleTask {
  task: string;
  dueDate: string;
  priority: string;
}

interface Schedule {
  tasks: ScheduleTask[];
}

export function Schedule() {
  const { toast } = useToast();

  // TODO: Get the actual syllabusId from context or state
  const syllabusId = 1;

  const { data: schedule, isLoading } = useQuery<Schedule>({
    queryKey: [`/api/schedule/${syllabusId}`],
    enabled: !!syllabusId,
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return <div>Loading schedule...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {schedule?.tasks?.map((task, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  task.priority === 'high'
                    ? 'border-red-200 bg-red-50'
                    : task.priority === 'medium'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <h3 className="font-medium">{task.task}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 text-sm">
                  Priority:{' '}
                  <span className="font-medium capitalize">{task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}