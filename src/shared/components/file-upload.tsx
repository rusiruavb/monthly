import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  className?: string;
  id?: string;
}

export function FileUpload({ onFileSelect, selectedFile, className, id }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
        aria-label="Upload file"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        aria-label="Choose file to upload"
      >
        <Upload className="h-4 w-4" />
        {selectedFile ? selectedFile.name.slice(0, 20) : "Attach"}
      </Button>
    </div>
  );
}
