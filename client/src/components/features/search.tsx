import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search as SearchIcon, Briefcase, MapPin, Tags, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserProfile {
  interests: string[];
  skills: string[];
  city: string;
  state: string;
}

interface Job {
  title: string;
  description: string;
  type: string;
  location: string;
  payRange?: string;
  matchingSkills?: string[];
}

interface JobResponse {
  jobs: Job[];
}

export function Search() {
  const [profile, setProfile] = useState<UserProfile>({
    interests: [],
    skills: [],
    city: "",
    state: "",
  });
  const [currentInput, setCurrentInput] = useState("");
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/search/jobs", { 
        profile,
        query: currentInput 
      });
      const data: JobResponse = await response.json();
      return data.jobs;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      if (data.length === 0) {
        toast({
          title: "No results",
          description: "No matching jobs found. Try different keywords or update your profile.",
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

  const handleAddItem = (type: 'interests' | 'skills') => {
    if (!currentInput.trim()) return;
    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], currentInput.trim()]
    }));
    setCurrentInput("");
  };

  const handleRemoveItem = (type: 'interests' | 'skills', item: string) => {
    setProfile(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== item)
    }));
  };

  const handleSearch = () => {
    if (!profile.city || !profile.state) {
      toast({
        title: "Location Required",
        description: "Please enter your city and state before searching",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Your Gig Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="Enter your city"
                value={profile.city}
                onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Input
                placeholder="Enter your state"
                value={profile.state}
                onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
              />
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Interests</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add your interests"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem('interests')}
              />
              <Button onClick={() => handleAddItem('interests')}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 rounded-full text-sm flex items-center gap-1"
                  onClick={() => handleRemoveItem('interests', interest)}
                >
                  {interest}
                  <button className="hover:text-primary">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add your skills"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddItem('skills')}
              />
              <Button onClick={() => handleAddItem('skills')}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 rounded-full text-sm flex items-center gap-1"
                  onClick={() => handleRemoveItem('skills', skill)}
                >
                  {skill}
                  <button className="hover:text-primary">×</button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Available Gigs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleSearch} 
              disabled={searchMutation.isPending}
              className="w-full"
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              {searchMutation.isPending ? "Searching..." : "Find Gigs"}
            </Button>

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
                      {job.payRange && (
                        <span className="flex items-center gap-1">
                          <Tags className="h-4 w-4" />
                          {job.payRange}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm">{job.description}</p>
                    {job.matchingSkills && job.matchingSkills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.matchingSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-secondary/50 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}