import { CategoryManager } from "@/components/admin/category-manager";
import { adminListCategories } from "@/lib/services/categoryService";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await adminListCategories();
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Categories</h1>
        <p className="text-sm text-muted-foreground">Add, rename, hide or remove property categories.</p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
