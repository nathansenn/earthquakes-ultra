import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <PageSkeleton hero="from-orange-600 via-red-600 to-red-700" cards={6} />;
}
