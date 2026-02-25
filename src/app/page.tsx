import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/ProductCard";
import type { Product, Category } from "@/types";
import CategoryFilter from "@/components/shop/CategoryFilter";
import Navbar from "@/components/layout/Navbar";

interface HomePageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category_id", category);
  }

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: products } = await query;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Termékeink</h1>
          <p className="text-muted-foreground">
            Fedezd fel kínálatunkat és találd meg a számodra tökéletes terméket
          </p>
        </div>

        <CategoryFilter
          categories={(categories ?? []) as Category[]}
          selectedCategory={category}
          searchQuery={q}
        />

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg">Nem találtunk termékeket.</p>
            <p className="text-sm">Próbálj más keresési feltételt!</p>
          </div>
        )}
      </main>
      <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WebShop. Minden jog fenntartva.
      </footer>
    </div>
  );
}
