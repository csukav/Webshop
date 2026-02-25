"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types";

export default function CategoryActions({ category }: { category: Category }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: name.trim(), description: description.trim() || null })
      .eq("id", category.id);

    if (error) {
      toast.error("Hiba: " + error.message);
    } else {
      toast.success("Kategória frissítve!");
      setEditOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);
    if (error) {
      toast.error("Hiba a törlés során!");
    } else {
      toast.success("Kategória törölve!");
      setDeleteOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3 w-3 mr-1" />
          Szerkesztés
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Törlés
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategória szerkesztése</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>Név *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Leírás</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Mégse
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Mentés..." : "Mentés"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategória törlése</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Biztosan törlöd a <strong>{category.name}</strong> kategóriát? A
            hozzátartozó termékekről az összekötés megszűnik.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Mégse
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Törlés..." : "Törlés"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
