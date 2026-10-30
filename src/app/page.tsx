import { CommandPalette } from "@/components/CommandPalette";
import { Hero } from "@/components/hero/Hero";
import { Intro } from "@/components/Intro";
import { LoopRuntime } from "@/components/LoopRuntime";
import { Nav } from "@/components/Nav";
import { About } from "@/components/sections/About";
import { Arcade } from "@/components/sections/Arcade";
import { Contact, Footer } from "@/components/sections/Contact";
import { Process } from "@/components/sections/Process";
import { Projects } from "@/components/sections/Projects";
import { Services } from "@/components/sections/Services";
import { Skills } from "@/components/sections/Skills";
import { Stage } from "@/components/world/Stage";

export default function Home() {
  return (
    <>
      <Intro />
      <LoopRuntime />
      <Stage />
      <Nav />
      <CommandPalette />
      <main className="relative z-10 overflow-x-clip">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Services />
        <Process />
        <Arcade />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
