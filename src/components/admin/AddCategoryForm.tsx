"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AddCategoryForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(toSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("A név és a slug megadása kötelező!");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
    });

    if (error) {
      toast.error(
        error.code === "23505"
          ? "Ez a slug már foglalt. Válassz másikat!"
          : "Hiba: " + error.message,
      );
    } else {
      toast.success("Kategória létrehozva!");
      setName("");
      setSlug("");
      setDescription("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Új kategória</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catName">Név *</Label>
            <Input
              id="catName"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="pl. Elektronika"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catSlug">Slug *</Label>
            <Input
              id="catSlug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="pl. elektronika"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catDesc">Leírás</Label>
            <Textarea
              id="catDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcionális leírás..."
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Mentés..." : "Kategória hozzáadása"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
