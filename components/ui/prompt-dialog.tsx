"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * A nice in-app single-field text editor, replacing the browser's native prompt().
 * Wrap the trigger (e.g. an edit button) as the child. Submitting calls onSubmit
 * with the trimmed value; nothing runs on cancel.
 */
export function PromptDialog({
  children,
  title,
  label,
  initialValue = "",
  placeholder,
  multiline = false,
  minLength = 1,
  confirmLabel = "Save",
  onSubmit,
}: {
  children: React.ReactNode; // the trigger (rendered via asChild)
  title: string;
  label: string;
  initialValue?: string;
  placeholder?: string;
  multiline?: boolean;
  minLength?: number;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);

  // Reset to the latest initial value each time the dialog opens.
  function handleOpenChange(next: boolean) {
    if (next) setValue(initialValue);
    setOpen(next);
  }

  function submit() {
    const trimmed = value.trim();
    if (trimmed.length < minLength) return;
    setOpen(false);
    onSubmit(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label>{label}</Label>
          {multiline ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              rows={3}
              autoFocus
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={value.trim().length < minLength}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
