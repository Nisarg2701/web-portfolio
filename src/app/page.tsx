import { Hero } from "@/components/Hero";
import { SkillWheel } from "@/components/SkillWheel";
import { ExperienceStack } from "@/components/ExperienceStack";
import { ProjectsList } from "@/components/ProjectsList";
import { Certifications } from "@/components/Certifications";
import { EducationAndLeadership } from "@/components/EducationAndLeadership";
import { Footer } from "@/components/Footer";
import { Navbar, BackToTop } from "@/components/Navbar";
import { WhatsApp } from "@/components/WhatsApp";

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <Hero />
      <SkillWheel />
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
