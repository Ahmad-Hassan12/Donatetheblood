"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      data-bg="light"
      className="flex min-h-svh items-center justify-center bg-white px-6 pb-24 pt-28"
    >
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blood/10">
          <TriangleAlert size={26} className="text-blood" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          An unexpected error interrupted this page. Your session is safe — try
          again, and if it keeps happening we&apos;d like to know.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-blood px-8 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
        >
          Try again
        </button>
      </div>
    </main>
  );
}