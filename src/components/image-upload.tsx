import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    if (!file.type.startsWith("image/")) { toast.error("File must be an image."); return; }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("uploads").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Upload preview" className="h-32 rounded border border-border" />
          <button type="button" onClick={()=>onChange("")} className="absolute -top-2 -right-2 size-6 bg-background border border-border rounded-full flex items-center justify-center hover:border-destructive">
            <X className="size-3" />
          </button>
        </div>
      ) : null}
      <label className="inline-block">
        <input type="file" accept="image/*" onChange={handle} className="hidden" disabled={uploading} />
        <Button type="button" variant="outline" size="sm" asChild>
          <span className="cursor-pointer"><Upload className="size-4 mr-2" />{uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}</span>
        </Button>
      </label>
    </div>
  );
}