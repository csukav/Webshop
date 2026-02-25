import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Category } from "@/types";
import CategoryActions from "@/components/admin/CategoryActions";
import AddCategoryForm from "@/components/admin/AddCategoryForm";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kategóriák</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add form */}
        <div>
          <AddCategoryForm />
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Leírás</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories && categories.length > 0 ? (
                categories.map((cat: Category) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {cat.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {cat.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <CategoryActions category={cat} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Még nincsenek kategóriák.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
