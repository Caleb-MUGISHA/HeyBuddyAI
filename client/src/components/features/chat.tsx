import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

export function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", content: "Hey Buddy! How can I help you today?" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    setMessages([
      ...messages,
      { type: "user", content: message },
    ]);
    setMessage("");
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat with Hey Buddy</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 ${
                msg.type === "bot" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <p>{msg.content}</p>
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
