import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { HelpCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function QuickHelp() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const { toast } = useToast();

  const helpMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get help");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Format the response with proper styling
      toast({
        title: "Study Advice",
        description: (
          <div className="prose prose-sm mt-2 space-y-2">
            {data.response.split('\n').map((paragraph: string, index: number) => (
              <p key={index} className="text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ),
        className: "bg-card border-2 border-primary/20",
        duration: 10000, // Show for 10 seconds
      });
      setOpen(false);
      setQuestion("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get help",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || helpMutation.isPending) return;
    helpMutation.mutate(question);
  };

  return (
    <>
      <motion.div
        className="fixed top-4 right-4 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg bg-white text-primary hover:bg-white/90"
          onClick={() => setOpen(true)}
        >
          <HelpCircle className="mr-2 h-5 w-5" />
          Quick Help
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ask for Help</DialogTitle>
            <DialogDescription>
              Ask any question about your studies and get instant AI-powered guidance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={helpMutation.isPending}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={helpMutation.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={!question.trim() || helpMutation.isPending}>
                {helpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  "Get Help"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}