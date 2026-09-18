import type { Metadata } from "next";
import SearchPage from "@/components/search/SearchPage";

export const metadata: Metadata = {
  title: "Find a Donor — Donate the Blood",
  description:
    "Search verified blood donors near you by blood group and location. Contact details stay private until you request them.",
};

export default function Search() {
  return <SearchPage />;
}