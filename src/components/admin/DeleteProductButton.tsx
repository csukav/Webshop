"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
}

export default function DeleteProductButton({ id, name }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Hiba a törlés során!");
    } else {
      toast.success(`${name} törölve!`);
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-3 w-3 mr-1" />
          Törlés
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Termék törlése</DialogTitle>
          <DialogDescription>
            Biztosan törlöd a <strong>{name}</strong> terméket? Ez a művelet nem
            vonható vissza.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Mégse
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Törlés..." : "Törlés megerősítése"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
