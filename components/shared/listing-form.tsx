"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/shared/image-uploader";
import { LocationPicker } from "@/components/shared/location-picker";
import { toast } from "@/components/ui/use-toast";
import { listingInputSchema, type ListingInput } from "@/lib/validation/listing.schema";
import { createListingAction, updateListingAction } from "@/lib/actions/listing";
import { AMENITIES, CITY_CENTER, DEFAULT_CITY } from "@/lib/config";
import type { Category, OwnerListing } from "@/lib/types";

type FormValues = ListingInput & { photos: string[] };

export function ListingForm({
  categories,
  existing,
}: {
  categories: Category[];
  existing?: OwnerListing;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [coords, setCoords] = useState({
    lat: existing?.exactLat ?? CITY_CENTER.lat,
    lng: existing?.exactLng ?? CITY_CENTER.lng,
  });

  const {
    register, handleSubmit, control, setValue, watch, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(listingInputSchema as never),
    defaultValues: {
      title: existing?.title ?? "",
      categoryId: existing ? categories.find((c) => c.name === existing.categoryName)?.id ?? "" : "",
      description: existing?.description ?? "",
      monthlyRent: existing?.monthlyRent ?? 0,
      securityDeposit: existing?.securityDeposit ?? 0,
      advanceRequired: existing?.advanceRequired ?? false,
      isNegotiable: existing?.isNegotiable ?? false,
      electricityIncluded: existing?.electricityIncluded ?? false,
      waterIncluded: existing?.waterIncluded ?? false,
      availableFrom: existing?.availableFrom ?? "",
      area: existing?.area ?? "",
      wardNumber: existing?.wardNumber ?? undefined,
      city: existing?.city ?? DEFAULT_CITY.name,
      nearbyLandmark: existing?.nearbyLandmark ?? "",
      latitude: existing?.exactLat ?? CITY_CENTER.lat,
      longitude: existing?.exactLng ?? CITY_CENTER.lng,
      ownerName: existing?.ownerName ?? "",
      ownerPhone: existing?.ownerPhone ?? "",
      ownerWhatsapp: existing?.ownerWhatsapp ?? "",
      ownerEmail: existing?.ownerEmail ?? "",
      exactAddress: existing?.exactAddress ?? "",
      coverImage: existing?.coverImage ?? "",
      galleryImages: existing?.gallery ?? [],
      totalRooms: existing?.totalRooms ?? 0,
      bedrooms: existing?.bedrooms ?? 0,
      kitchens: existing?.kitchens ?? 0,
      bathrooms: existing?.bathrooms ?? 0,
      floorNumber: existing?.floorNumber ?? undefined,
      areaSqft: existing?.areaSqft ?? undefined,
      amenities: existing?.amenities ?? [],
      photos: existing?.gallery ?? [],
    },
  });

  const amenities = watch("amenities") ?? [];
  const photos = watch("photos") ?? [];

  function toggleAmenity(a: string) {
    const next = amenities.includes(a) ? amenities.filter((x) => x !== a) : [...amenities, a];
    setValue("amenities", next, { shouldValidate: true });
  }

  function onSubmit(values: FormValues) {
    // `photos` lives in component state (watch) — the Zod resolver strips it from
    // `values`, so read it from the closure, not from `values`.
    if (photos.length === 0) {
      toast({ variant: "destructive", title: "Add at least one photo" });
      return;
    }
    const payload: ListingInput = {
      ...values,
      coverImage: photos[0],
      galleryImages: photos,
      latitude: coords.lat,
      longitude: coords.lng,
    };

    startTransition(async () => {
      const res = existing
        ? await updateListingAction(existing.id, payload)
        : await createListingAction(payload);
      if (res.ok) {
        toast({ title: existing ? "Listing updated" : "Listing submitted", description: res.message });
        router.push("/owner/listings");
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Could not save", description: res.error });
      }
    });
  }

  const err = (k: keyof FormValues) => errors[k]?.message as string | undefined;

  // If validation blocks submission, tell the user which field instead of silently
  // doing nothing.
  function onInvalid(formErrors: typeof errors) {
    const first = Object.values(formErrors)[0] as { message?: string } | undefined;
    toast({
      variant: "destructive",
      title: "Please check the form",
      description: first?.message ?? "Some required fields are missing or invalid.",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      {/* Basics */}
      <Card>
        <CardHeader><CardTitle>Basics</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" error={err("title")} className="sm:col-span-2">
            <Input {...register("title")} placeholder="e.g. Sunny 2BHK near Lakeside" />
          </Field>
          <Field label="Category" error={err("categoryId")}>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Available from" error={err("availableFrom")}>
            <Input type="date" {...register("availableFrom")} />
          </Field>
          <Field label="Description" error={err("description")} className="sm:col-span-2">
            <Textarea rows={5} {...register("description")} placeholder="Describe the property, neighborhood and what's included…" />
          </Field>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Monthly rent (Rs.)" error={err("monthlyRent")}>
            <Input type="number" min={0} {...register("monthlyRent")} />
          </Field>
          <Field label="Security deposit (Rs.)" error={err("securityDeposit")}>
            <Input type="number" min={0} {...register("securityDeposit")} />
          </Field>
          <div className="flex flex-col justify-center gap-3 sm:col-span-3 sm:flex-row sm:flex-wrap sm:gap-6">
            <ToggleField control={control} name="advanceRequired" label="Advance payment required" />
            <ToggleField control={control} name="isNegotiable" label="Rent negotiable" />
            <ToggleField control={control} name="electricityIncluded" label="Electricity included in rent" />
            <ToggleField control={control} name="waterIncluded" label="Water included in rent" />
          </div>
        </CardContent>
      </Card>

      {/* Property details */}
      <Card>
        <CardHeader><CardTitle>Property details</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Total rooms"><Input type="number" min={0} {...register("totalRooms")} /></Field>
          <Field label="Bedrooms"><Input type="number" min={0} {...register("bedrooms")} /></Field>
          <Field label="Kitchens"><Input type="number" min={0} {...register("kitchens")} /></Field>
          <Field label="Bathrooms"><Input type="number" min={0} {...register("bathrooms")} /></Field>
          <Field label="Floor number"><Input type="number" {...register("floorNumber")} /></Field>
          <Field label="Area (sq ft)"><Input type="number" min={0} {...register("areaSqft")} /></Field>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox checked={amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />
              {a}
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Area (optional)" error={err("area")}><Input {...register("area")} placeholder="e.g. Lakeside" /></Field>
            <Field label="Ward number"><Input type="number" min={0} {...register("wardNumber")} /></Field>
            <Field label="City"><Input {...register("city")} defaultValue={DEFAULT_CITY.name} /></Field>
            <Field label="Nearby landmark" className="sm:col-span-3"><Input {...register("nearbyLandmark")} placeholder="e.g. near Lakeside chowk" /></Field>
          </div>

          <div>
            <Label className="mb-2 block">Pin the exact location (private — used for admin only)</Label>
            <LocationPicker
              lat={coords.lat}
              lng={coords.lng}
              onChange={(c) => {
                setCoords(c);
                setValue("latitude", c.lat);
                setValue("longitude", c.lng);
              }}
            />
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Latitude" error={err("latitude")}>
                <Input type="number" step="any" value={coords.lat}
                  onChange={(e) => { const lat = parseFloat(e.target.value); setCoords((c) => ({ ...c, lat })); setValue("latitude", lat); }} />
              </Field>
              <Field label="Longitude" error={err("longitude")}>
                <Input type="number" step="any" value={coords.lng}
                  onChange={(e) => { const lng = parseFloat(e.target.value); setCoords((c) => ({ ...c, lng })); setValue("longitude", lng); }} />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owner contact (private) */}
      <Card>
        <CardHeader>
          <CardTitle>Owner contact (private)</CardTitle>
          <p className="text-sm text-muted-foreground">Never shown publicly. Only the GharBhada team sees this to mediate.</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Owner name" error={err("ownerName")}><Input {...register("ownerName")} /></Field>
          <Field label="Owner phone" error={err("ownerPhone")}><Input {...register("ownerPhone")} placeholder="98xxxxxxxx" /></Field>
          <Field label="Owner WhatsApp"><Input {...register("ownerWhatsapp")} placeholder="98xxxxxxxx" /></Field>
          <Field label="Owner email"><Input type="email" {...register("ownerEmail")} /></Field>
          <Field label="Exact address" className="sm:col-span-2"><Input {...register("exactAddress")} placeholder="House no, tole, ward" /></Field>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
        <CardContent>
          <ImageUploader value={photos} onChange={(urls) => setValue("photos", urls, { shouldValidate: true })} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : existing ? "Save changes" : "Submit for approval"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
      <p className="text-xs text-muted-foreground">
        New and edited listings go to admin review before appearing publicly.
      </p>
    </form>
  );
}

function Field({
  label, error, className, children,
}: {
  label: string; error?: string; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ToggleField({
  control, name, label,
}: {
  control: Control<FormValues>; name: keyof FormValues; label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Controller
        control={control}
        name={name as never}
        render={({ field }) => (
          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
        )}
      />
      {label}
    </label>
  );
}
