import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function Loading() {
  return <PageSkeleton hero="from-red-700 via-orange-600 to-yellow-600" cards={8} />;
}
