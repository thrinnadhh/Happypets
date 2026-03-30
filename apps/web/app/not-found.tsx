"use client";

import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";

export default function NotFound(): JSX.Element {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col justify-center">
      <EmptyState
        variant="not-found"
        onAction={() => router.push("/")}
        actionLabel="Return Home"
        className="min-h-[60vh]"
      />
    </div>
  );
}
