"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleClick = () => {
    addItem(product);
    toast.success(`${product.name} kosárhoz adva!`);
  };

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={product.stock === 0}
      className="w-full sm:w-auto"
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      {product.stock === 0 ? "Elfogyott" : "Kosárba teszem"}
    </Button>
  );
}
