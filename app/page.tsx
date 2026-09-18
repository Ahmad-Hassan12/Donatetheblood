import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import ProblemStatement from "@/components/home/ProblemStatement";
import HowItWorks from "@/components/home/HowItWorks";
import RequestsPreview from "@/components/home/RequestsPreview";
import TrustSection from "@/components/home/TrustSection";
import CTABanner from "@/components/home/CTABanner";
import ScrollingBloodCells from "@/components/home/ScrollingBloodCells";
import AboutTeaser from "@/components/home/AboutTeaser";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <ScrollingBloodCells />
      <Hero />
      <Stats />
      <ProblemStatement />
      <HowItWorks />
      <RequestsPreview />
      <TrustSection />
      <CTABanner />
      <AboutTeaser />
    </main>
  );
}