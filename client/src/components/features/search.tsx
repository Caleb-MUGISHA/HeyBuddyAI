import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon, Briefcase, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Job {
  title: string;
  description: string;
  type: string;
  location: string;
}

interface JobResponse {
  jobs: Job[];
}

export function Search() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<Job[]>([]);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await apiRequest("POST", "/api/search/jobs", { query: searchQuery });
      const data: JobResponse = await response.json();
      return data.jobs;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      if (data.length === 0) {
        toast({
          title: "No results",
          description: "No matching jobs found. Try different keywords.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to search for jobs",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    searchMutation.mutate(query);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Search Jobs & Side Gigs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for jobs or side gigs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searchMutation.isPending}>
              <SearchIcon className="h-4 w-4 mr-2" />
              {searchMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>

          <ScrollArea className="h-[400px] mt-4">
            <div className="space-y-4">
              {searchResults.map((job, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-medium text-lg">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{job.description}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}