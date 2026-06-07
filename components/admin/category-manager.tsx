"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

  function add() {
    if (name.trim().length < 2) return;
    run(() => upsertCategoryAction({ name: name.trim(), isActive: true, sortOrder: categories.length }));
    setName("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex gap-2 p-4">
          <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add} disabled={pending}><Plus className="h-4 w-4" /> Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                {c.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Hidden</Badge>}
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch
                    checked={c.is_active}
                    disabled={pending}
                    onCheckedChange={(v) => run(() => upsertCategoryAction({ id: c.id, name: c.name, isActive: v, sortOrder: c.sort_order }))}
                  />
                </label>
                <Button size="icon" variant="ghost" disabled={pending}
                  onClick={() => {
                    const next = prompt("Rename category", c.name);
                    if (next && next.trim().length >= 2) run(() => upsertCategoryAction({ id: c.id, name: next.trim(), isActive: c.is_active, sortOrder: c.sort_order }));
                  }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}
                  onClick={() => { if (confirm(`Delete "${c.name}"?`)) run(() => deleteCategoryAction(c.id)); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No categories yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
