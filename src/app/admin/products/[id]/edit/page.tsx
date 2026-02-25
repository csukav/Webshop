import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import { notFound } from "next/navigation";
import type { Category, Product } from "@/types";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!product) return notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Termék szerkesztése</h1>
      <ProductForm
        product={product as Product}
        categories={(categories ?? []) as Category[]}
      />
    </div>
  );
}
