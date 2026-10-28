import { CommandPalette } from "@/components/CommandPalette";
import { Hero, TechMarquee } from "@/components/hero/Hero";
import { Intro } from "@/components/Intro";
import { LoopRuntime } from "@/components/LoopRuntime";
import { Nav } from "@/components/Nav";
import { About } from "@/components/sections/About";
import { Arcade } from "@/components/sections/Arcade";
import { Contact, Footer } from "@/components/sections/Contact";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Skills } from "@/components/sections/Skills";

export default function Home() {
  return (
    <>
      <Intro />
      <LoopRuntime />
      <Nav />
      <CommandPalette />
      <main className="relative overflow-x-clip">
        <Hero />
        <TechMarquee />
        <About />
        <Skills />
        <Projects />
        <Services />
        <Arcade />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
