import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import type { Product } from "@/types";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import Image from "next/image";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Termékek</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Új termék
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Kép</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>Kategória</TableHead>
              <TableHead>Ár</TableHead>
              <TableHead>Készlet</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map(
                (product: Product & { category: { name: string } | null }) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xl">
                            📦
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {product.category ? (
                        <Badge variant="secondary">
                          {product.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {Number(product.price ?? 0).toLocaleString("hu-HU")} Ft
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-500"
                            : "text-green-600"
                        }
                      >
                        {product.stock} db
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-3 w-3 mr-1" />
                            Szerkesztés
                          </Button>
                        </Link>
                        <DeleteProductButton
                          id={product.id}
                          name={product.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Még nincsenek termékek.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
