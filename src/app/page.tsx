"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Always route to public page on landing
    router.replace("/public");
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#991b2e] border-t-transparent" />
        <p className="text-xs text-zinc-500 font-medium">Opening School Sphere Campus...</p>
      </div>
    </div>
  );
}
