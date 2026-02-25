"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "pending", label: "Függőben" },
  { value: "processing", label: "Feldolgozás" },
  { value: "shipped", label: "Kiszállítva" },
  { value: "delivered", label: "Teljesítve" },
  { value: "cancelled", label: "Törölve" },
];

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const router = useRouter();

  const handleChange = async (value: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: value })
      .eq("id", orderId);

    if (error) {
      toast.error("Hiba a státusz frissítésekor!");
    } else {
      setStatus(value);
      toast.success("Státusz frissítve!");
      router.refresh();
    }
  };

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-36 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value} className="text-sm">
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
