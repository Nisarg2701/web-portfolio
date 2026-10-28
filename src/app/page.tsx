import { Hero } from "@/components/hero/Hero";
import { BentoGrid } from "@/components/sections/BentoGrid";
import { ExperienceStack } from "@/components/sections/ExperienceStack";
import { ProjectsList } from "@/components/sections/ProjectsList";
import { Certifications } from "@/components/sections/Certifications";
import { EducationAndLeadership } from "@/components/sections/EducationAndLeadership";
import { Footer } from "@/components/layout/Footer";
import { Navbar, BackToTop } from "@/components/layout/Navbar";
import { WhatsApp } from "@/components/layout/WhatsApp";

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <Hero />
      <BentoGrid />
      <ExperienceStack />
      <ProjectsList />
      <Certifications />
      <EducationAndLeadership />
      <Footer />
      <BackToTop />
      <WhatsApp />
    </main>
  );
}
