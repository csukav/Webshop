"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} kosárhoz adva!`);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
            📦
          </div>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Elfogyott
          </Badge>
        )}
        {product.category && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            {product.category.name}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base line-clamp-2 mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
        )}
        <p className="text-lg font-bold text-primary">
          {Number(product.price ?? 0).toLocaleString("hu-HU")} Ft
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Kosárba
        </Button>
        <Link href={`/products/${product.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
