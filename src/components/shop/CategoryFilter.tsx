"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";
import { useDebouncedCallback } from "use-debounce";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory?: string;
  searchQuery?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  searchQuery,
}: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateParams = useCallback(
    (params: Record<string, string | undefined>) => {
      const sp = new URLSearchParams();
      if (params.category && params.category !== "all")
        sp.set("category", params.category);
      if (params.q) sp.set("q", params.q);
      router.push(`${pathname}?${sp.toString()}`);
    },
    [router, pathname],
  );

  const handleSearch = useDebouncedCallback((value: string) => {
    updateParams({ category: selectedCategory, q: value || undefined });
  }, 400);

  const handleCategory = (catId: string) => {
    updateParams({ category: catId, q: searchQuery });
  };

  const clearFilters = () => router.push(pathname);

  const hasFilters =
    (selectedCategory && selectedCategory !== "all") || searchQuery;

  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Termék keresése..."
          defaultValue={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={
            !selectedCategory || selectedCategory === "all"
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={() => handleCategory("all")}
        >
          Összes
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Szűrők törlése
          </Button>
        )}
      </div>
    </div>
  );
}
