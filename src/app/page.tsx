import { Hero } from "@/components/Hero";
import { BentoGrid } from "@/components/BentoGrid";
import { ExperienceStack } from "@/components/ExperienceStack";
import { ProjectsList } from "@/components/ProjectsList";
import { Certifications } from "@/components/Certifications";
import { EducationAndLeadership } from "@/components/EducationAndLeadership";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <BentoGrid />
      <ExperienceStack />
      <ProjectsList />
      <Certifications />
      <EducationAndLeadership />
      <Footer />
    </main>
  );
}
