"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { updateContentAction } from "@/lib/actions/admin";

type Key = "terms" | "privacy";
type Row = { key: string; title: string; body: string };

function Editor({ initial, contentKey, heading }: { initial?: Row; contentKey: Key; heading: string }) {
  const [title, setTitle] = useState(initial?.title ?? heading);
  const [body, setBody] = useState(initial?.body ?? "");
  const [pending, start] = useTransition();
  const router = useRouter();

  function save() {
    start(async () => {
      const res = await updateContentAction({ key: contentKey, title, body });
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader><CardTitle>{heading}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Page title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Content</Label>
          <Textarea rows={14} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground">Plain text. Leave a blank line between paragraphs — they render with spacing on the public page.</p>
        </div>
        <Button onClick={save} disabled={pending}><Save className="h-4 w-4" /> Save</Button>
      </CardContent>
    </Card>
  );
}

export function ContentManager({ rows }: { rows: Row[] }) {
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  return (
    <div className="space-y-6">
      <Editor contentKey="terms" heading="Terms & Conditions" initial={byKey.terms} />
      <Editor contentKey="privacy" heading="Privacy Policy" initial={byKey.privacy} />
    </div>
  );
}
