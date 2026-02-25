"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Csak képfájlt tölthetsz fel!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A fájl mérete maximum 5 MB lehet!");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Hiba a feltöltés során: " + error.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    onChange(urlData.publicUrl);
    toast.success("Kép feltöltve!");
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
          <Image src={value} alt="Termék kép" fill className="object-contain" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Feltöltés folyamatban...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <p className="text-sm">Kattints a kép feltöltéséhez</p>
              <p className="text-xs">PNG, JPG, WebP (max 5MB)</p>
            </div>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={loading}
      />
      {!value && !loading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Kép kiválasztása
        </Button>
      )}
    </div>
  );
}
