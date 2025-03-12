import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";

export function Search() {
  const [query, setQuery] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Jobs & Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Search for jobs or campus events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button>
            <SearchIcon className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
