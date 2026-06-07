"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ImageUploader } from "@/components/shared/image-uploader";
import { upsertAdAction, deleteAdAction } from "@/lib/actions/admin";
import type { Advertisement } from "@/lib/types";

const POSITIONS = ["home_hero", "sidebar", "search_top"];

export function AdManager({ ads }: { ads: Advertisement[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", image: "", linkUrl: "", position: "home_hero" });

  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      toast(res.ok ? { title: res.message } : { variant: "destructive", title: "Error", description: res.error });
      router.refresh();
    });

  function add() {
    if (form.title.trim().length < 2 || !form.image) {
      toast({ variant: "destructive", title: "Title and image URL required" });
      return;
    }
    run(() => upsertAdAction({ ...form, isActive: true }));
    setForm({ title: "", image: "", linkUrl: "", position: "home_hero" });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>New advertisement</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Link URL</Label><Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/owner/listings/new" /></div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Banner image</Label>
            <ImageUploader
              single
              max={1}
              value={form.image ? [form.image] : []}
              onChange={(urls) => setForm({ ...form, image: urls[0] ?? "" })}
            />
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="…or paste an image URL (https://…)"
              className="mt-2"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Position</Label>
            <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2"><Button onClick={add} disabled={pending}><Plus className="h-4 w-4" /> Add advertisement</Button></div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="space-y-3 p-4">
              <div className="relative aspect-[16/6] overflow-hidden rounded-md bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image src={ad.image} alt={ad.title} fill sizes="400px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">{ad.position}</p>
                </div>
                {ad.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Off</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={ad.isActive} disabled={pending}
                    onCheckedChange={(v) => run(() => upsertAdAction({ id: ad.id, title: ad.title, image: ad.image, linkUrl: ad.linkUrl ?? "", position: ad.position, isActive: v }))} />
                  Active
                </label>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}
                  onClick={() => { if (confirm("Delete ad?")) run(() => deleteAdAction(ad.id)); }}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {ads.length === 0 && <p className="text-sm text-muted-foreground">No advertisements yet.</p>}
      </div>
    </div>
  );
}
