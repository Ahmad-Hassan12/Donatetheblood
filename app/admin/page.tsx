import type { Metadata } from "next";
import AdminPage from "@/components/admin/AdminPage";

export const metadata: Metadata = {
  title: "Admin Console — Donate the Blood",
  description:
    "Verify donors, review open requests, and keep the Donate the Blood donor network trustworthy.",
};

export default function AdminRoute() {
  return <AdminPage />;
}