"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PromptDialog } from "@/components/ui/prompt-dialog";
import { toast } from "@/components/ui/use-toast";
import { upsertCategoryAction, deleteCategoryAction } from "@/lib/actions/admin";
import type { CategoryRow } from "@/lib/types/database";

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });

  // Save a category with the given overrides merged onto its current values.
  const save = (c: CategoryRow, patch: Partial<{ name: string; isActive: boolean; showInNav: boolean; showOnHome: boolean; sortOrder: number }>) =>
    run(() =>
      upsertCategoryAction({
        id: c.id,
        name: patch.name ?? c.name,
        isActive: patch.isActive ?? c.is_active,
        showInNav: patch.showInNav ?? c.show_in_nav,
        showOnHome: patch.showOnHome ?? c.show_on_home,
        sortOrder: patch.sortOrder ?? c.sort_order,
      }),
    );

  function add() {
    if (name.trim().length < 2) return;
    run(() => upsertCategoryAction({ name: name.trim(), isActive: true, showInNav: false, showOnHome: false, sortOrder: categories.length }));
    setName("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex gap-2 p-4">
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add} disabled={pending}><Plus className="h-4 w-4" /> Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-3 py-3 text-center font-medium">Position</th>
                <th className="px-3 py-3 text-center font-medium">Active</th>
                <th className="px-3 py-3 text-center font-medium">In navbar</th>
                <th className="px-3 py-3 text-center font-medium">On home</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Input
                      type="number"
                      defaultValue={c.sort_order}
                      className="mx-auto h-8 w-16 text-center"
                      onBlur={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!Number.isNaN(v) && v !== c.sort_order) save(c, { sortOrder: v });
                      }}
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Switch checked={c.is_active} disabled={pending} onCheckedChange={(v) => save(c, { isActive: v })} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Switch checked={c.show_in_nav} disabled={pending} onCheckedChange={(v) => save(c, { showInNav: v })} />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Switch checked={c.show_on_home} disabled={pending} onCheckedChange={(v) => save(c, { showOnHome: v })} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PromptDialog
                      title="Rename category"
                      label="Category name"
                      initialValue={c.name}
                      minLength={2}
                      onSubmit={(name) => save(c, { name })}
                    >
                      <Button size="icon" variant="ghost" disabled={pending}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PromptDialog>
                    <ConfirmDialog
                      title={`Delete "${c.name}"?`}
                      description="Listings in this category will no longer be grouped under it."
                      confirmLabel="Delete"
                      destructive
                      onConfirm={() => run(() => deleteCategoryAction(c.id))}
                    >
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmDialog>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        <strong>Position</strong> controls the order in the navbar and home sections (lower = first).
        <strong> In navbar</strong> shows the tag in the top menu. <strong>On home</strong> adds a section on the
        home page (only appears when that category has listings).
      </p>
    </div>
  );
}
