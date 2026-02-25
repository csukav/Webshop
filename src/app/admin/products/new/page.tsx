import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/types";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Új termék hozzáadása</h1>
      <ProductForm categories={(categories ?? []) as Category[]} />
    </div>
  );
}
