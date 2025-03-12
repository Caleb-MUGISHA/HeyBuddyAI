import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";

interface Props {
  onUploadSuccess: (syllabusId: number) => void;
}

export function SyllabusUpload({ onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/syllabi", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/syllabi"] });
      setFile(null);
      onUploadSuccess(data.id);
      toast({
        title: "Success",
        description: "Syllabus uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload syllabus",
        variant: "destructive",
      });
    },
  });

  const handleUpload = async () => {
    if (!file) return;
    upload.mutate(file);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Upload Your Syllabus</h2>
        <p className="text-muted-foreground">
          Upload your course syllabus to get personalized recommendations and schedule
        </p>
      </div>

      <div className="grid w-full max-w-sm items-center gap-4">
        <Input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          onClick={handleUpload}
          disabled={!file || upload.isPending}
          className="w-full"
        >
          {upload.isPending ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Syllabus
            </>
          )}
        </Button>
      </div>
    </div>
  );
}