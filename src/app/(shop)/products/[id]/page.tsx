import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (!product) return notFound();

  const p = product as Product;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          {p.image_url ? (
            <Image
              src={p.image_url}
              alt={p.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {p.category && (
            <Badge variant="secondary" className="w-fit">
              {p.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold">{p.name}</h1>
          {p.description && (
            <p className="text-muted-foreground leading-relaxed">
              {p.description}
            </p>
          )}
          <div className="text-3xl font-bold text-primary">
            {Number(p.price ?? 0).toLocaleString("hu-HU")} Ft
          </div>
          <div className="text-sm text-muted-foreground">
            {p.stock > 0 ? (
              <span className="text-green-600 font-medium">
                ✓ Raktáron ({p.stock} db)
              </span>
            ) : (
              <span className="text-red-500 font-medium">✗ Elfogyott</span>
            )}
          </div>
          <AddToCartButton product={p} />
        </div>
      </div>
    </div>
  );
}
