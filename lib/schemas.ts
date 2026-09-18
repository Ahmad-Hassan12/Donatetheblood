import { z } from "zod";
import { BLOOD_GROUPS } from "@/lib/search-types";
import type { BloodGroup } from "@/lib/search-types";

const bloodGroupSchema = z.enum(
  BLOOD_GROUPS as [BloodGroup, ...BloodGroup[]]
);

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a valid phone number")
  .regex(/^\+?[\d\s()-]{8,18}$/, "Enter a valid phone number");

const cnicSchema = z
  .string()
  .trim()
  .regex(/^\d{5}-\d{7}-\d{1}$/, "Enter a valid CNIC like 42101-1234567-8");

/** Fields editable on the donor dashboard. Email is required here —
 *  a donor cannot be marked available without a valid email. */
export const profileEditSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  bloodGroup: bloodGroupSchema,
  city: z.string().trim().min(1, "Enter your city"),
  area: z.string().trim().min(1, "Enter your area or neighborhood"),
  cnicNumber: cnicSchema,
});

export const CONTACT_SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "careers", label: "Careers" },
  { value: "support", label: "Support" },
  { value: "privacy", label: "Privacy Concern" },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"];
export const contactSubjectSchema = z.enum(
  CONTACT_SUBJECTS.map((s) => s.value) as [
    ContactSubject,
    ...ContactSubject[],
  ]
);

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  subject: contactSubjectSchema,
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(2000, "Keep it under 2000 characters"),
});

export type ContactValues = z.infer<typeof contactSchema>;

export type Urgency = "low" | "medium" | "high" | "critical";