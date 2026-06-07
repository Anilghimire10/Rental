import { Badge } from "@/components/ui/badge";
import { titleCase } from "@/lib/utils";
import type { InquiryStatus, ListingStatus, VisitStatus } from "@/lib/types";

const listingVariant: Record<ListingStatus, "warning" | "success" | "destructive"> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};
const inquiryVariant: Record<InquiryStatus, "warning" | "accent" | "success"> = {
  new: "warning",
  contacted: "accent",
  resolved: "success",
};
const visitVariant: Record<VisitStatus, "warning" | "accent" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "accent",
  completed: "success",
  cancelled: "destructive",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge variant={listingVariant[status]}>{titleCase(status)}</Badge>;
}
export function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  return <Badge variant={inquiryVariant[status]}>{titleCase(status)}</Badge>;
}
export function VisitStatusBadge({ status }: { status: VisitStatus }) {
  return <Badge variant={visitVariant[status]}>{titleCase(status)}</Badge>;
}
