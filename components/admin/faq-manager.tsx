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
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/use-toast";
import { upsertFaqAction, deleteFaqAction } from "@/lib/actions/admin";
import type { FaqRow } from "@/lib/types/database";

export function FaqManager({ faqs }: { faqs: FaqRow[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  // Existing group titles, for the autocomplete datalist.
  const groups = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));

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
    run(() =>
      upsertFaqAction({
        category: category.trim() || "General",
        question: q.trim(),
        answer: a.trim(),
        isActive: true,
        sortOrder: faqs.length,
      }),
    );
    setCategory(""); setQ(""); setA("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>New FAQ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Group title</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="faq-groups"
              placeholder="e.g. Renting, Listing, Payments (defaults to General)"
            />
            <datalist id="faq-groups">
              {groups.map((g) => <option key={g} value={g} />)}
            </datalist>
          </div>
          <div className="space-y-1.5"><Label>Question</Label><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Is it free to list a property?" /></div>
          <div className="space-y-1.5"><Label>Answer</Label><Textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} placeholder="Yes — listing is completely free…" /></div>
          <Button onClick={add} disabled={pending}><Plus className="h-4 w-4" /> Add FAQ</Button>
        </CardContent>
      </Card>

      {groups.map((group) => (
        <Card key={group}>
          <CardHeader className="pb-2"><CardTitle className="text-base">{group}</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {faqs.filter((f) => f.category === group).map((f) => (
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
                    onCheckedChange={(v) => run(() => upsertFaqAction({ id: f.id, category: f.category, question: f.question, answer: f.answer, isActive: v, sortOrder: f.sort_order }))}
                  />
                  <FaqEditDialog
                    faq={f}
                    disabled={pending}
                    onSave={(values) => run(() => upsertFaqAction({ id: f.id, ...values, isActive: f.is_active, sortOrder: f.sort_order }))}
                  />
                  <ConfirmDialog
                    title="Delete this FAQ?"
                    description="This cannot be undone."
                    confirmLabel="Delete"
                    destructive
                    onConfirm={() => run(() => deleteFaqAction(f.id))}
                  >
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ConfirmDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {faqs.length === 0 && (
        <Card><CardContent><p className="py-6 text-center text-sm text-muted-foreground">No FAQs yet.</p></CardContent></Card>
      )}
    </div>
  );
}

/** Modal editor for a single FAQ — replaces the old prompt() chain. */
function FaqEditDialog({
  faq,
  disabled,
  onSave,
}: {
  faq: FaqRow;
  disabled: boolean;
  onSave: (values: { category: string; question: string; answer: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(faq.category);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);

  function handleOpenChange(next: boolean) {
    if (next) { setCategory(faq.category); setQuestion(faq.question); setAnswer(faq.answer); }
    setOpen(next);
  }

  function save() {
    if (question.trim().length < 5 || answer.trim().length < 5) return;
    setOpen(false);
    onSave({ category: category.trim() || "General", question: question.trim(), answer: answer.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" disabled={disabled}><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit FAQ</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Group title</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} list="faq-groups" placeholder="Defaults to General" />
            {/* Reuses the <datalist id="faq-groups"> rendered by the New FAQ form above. */}
          </div>
          <div className="space-y-1.5"><Label>Question</Label><Input value={question} onChange={(e) => setQuestion(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Answer</Label><Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} /></div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={save} disabled={question.trim().length < 5 || answer.trim().length < 5}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
