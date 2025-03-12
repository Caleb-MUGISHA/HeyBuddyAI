import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { StudyBuddy } from "@/components/features/study-buddy";
import { QuickHelp } from "@/components/features/quick-help";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <StudyBuddy />
      <QuickHelp />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;