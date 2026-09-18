import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main
      data-bg="light"
      className="flex min-h-svh items-center justify-center bg-white px-6 pb-24 pt-28"
    >
      <div className="mx-auto max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blood/10">
          <SearchX size={26} className="text-blood" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          The page you&apos;re looking for doesn&apos;t exist or has moved. If a
          link brought you here, let us know — otherwise head back home.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-blood px-8 text-sm font-semibold text-white transition-colors hover:bg-blood-deep"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}