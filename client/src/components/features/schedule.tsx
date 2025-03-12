import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Todo } from "@shared/schema";

export function Schedule() {
  const { data: todos, isLoading } = useQuery<Todo[]>({ 
    queryKey: ["/api/todos"]
  });

  if (isLoading) {
    return <div>Loading schedule...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {todos?.map((todo) => (
            <div key={todo.id} className="py-2">
              <h3 className="font-medium">{todo.task}</h3>
              <p className="text-sm text-muted-foreground">
                Due: {new Date(todo.dueDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
