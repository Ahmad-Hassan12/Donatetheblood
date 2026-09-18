import type { Metadata } from "next";
import SessionDashboard from "@/components/dashboard/SessionDashboard";

export const metadata: Metadata = {
  title: "Dashboard — Donate the Blood",
  description:
    "Manage your donor profile, availability, donation history, and alerts on Donate the Blood.",
};

export default function DashboardRoute() {
  return <SessionDashboard />;
}