"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { upsertFaqAction, deleteFaqAction } from "@/lib/actions/admin";
import type { FaqRow } from "@/lib/types/database";

export function FaqManager({ faqs }: { faqs: FaqRow[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });

  function add() {
    if (q.trim().length < 5 || a.trim().length < 5) {
      toast({ variant: "destructive", title: "Add a question and answer" });
      return;
    }
    run(() => upsertFaqAction({ question: q.trim(), answer: a.trim(), isActive: true, sortOrder: faqs.length }));
    setQ(""); setA("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>New FAQ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label>Question</Label><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Is it free to list a property?" /></div>
          <div className="space-y-1.5"><Label>Answer</Label><Textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} placeholder="Yes — listing is completely free…" /></div>
          <Button onClick={add} disabled={pending}><Plus className="h-4 w-4" /> Add FAQ</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {faqs.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {f.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Hidden</Badge>}
                <Switch
                  checked={f.is_active}
                  disabled={pending}
                  onCheckedChange={(v) => run(() => upsertFaqAction({ id: f.id, question: f.question, answer: f.answer, isActive: v, sortOrder: f.sort_order }))}
                />
                <Button size="icon" variant="ghost" disabled={pending}
                  onClick={() => {
                    const nq = prompt("Edit question", f.question);
                    if (nq === null) return;
                    const na = prompt("Edit answer", f.answer);
                    if (na === null) return;
                    if (nq.trim().length >= 5 && na.trim().length >= 5)
                      run(() => upsertFaqAction({ id: f.id, question: nq.trim(), answer: na.trim(), isActive: f.is_active, sortOrder: f.sort_order }));
                  }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}
                  onClick={() => { if (confirm("Delete this FAQ?")) run(() => deleteFaqAction(f.id)); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {faqs.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No FAQs yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
