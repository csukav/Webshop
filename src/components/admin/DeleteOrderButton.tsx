"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  orderId: string;
  redirectAfter?: boolean;
}

export default function DeleteOrderButton({ orderId, redirectAfter }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      toast.error(`Hiba a törléskor: ${error.message}`);
      setLoading(false);
      return;
    }

    toast.success("Rendelés törölve!");
    setOpen(false);
    if (redirectAfter) {
      router.push("/admin/orders");
    } else {
      router.refresh();
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rendelés törlése</DialogTitle>
            <DialogDescription>
              Biztosan törölni szeretnéd a rendelést? Ez a művelet nem vonható
              vissza, és az összes rendelési tétel is törlődik.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
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
    </>
  );
}
