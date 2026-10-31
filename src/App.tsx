import { SmoothScrollProvider } from './providers/SmoothScroll'
import { Aurora } from './components/layout/Aurora'
import { Footer } from './components/layout/Footer'
import { Grain } from './components/layout/Grain'
import { Nav } from './components/layout/Nav'
import { BrainCanvas } from './webgl/BrainCanvas'
import { Hero } from './sections/Hero'
import { ProofRail } from './sections/ProofRail'
import { Problem } from './sections/Problem'
import { Shift } from './sections/Shift'
import { HowItWorks } from './sections/HowItWorks'
import { Capabilities } from './sections/Capabilities'
import { Industries } from './sections/Industries'
import { Process } from './sections/Process'
import { Faq } from './sections/Faq'
import { Contact } from './sections/Contact'

export function App() {
  return (
    <SmoothScrollProvider>
      <a
        href="#main"
        className="sr-only fixed left-4 top-4 z-[70] rounded-full bg-ink px-5 py-3 font-medium text-void focus:not-sr-only"
      >
        Skip to content
      </a>
      <Aurora />
      <BrainCanvas />
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <ProofRail />
        <Problem />
        <Shift />
        <HowItWorks />
        <Capabilities />
        <Industries />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <Grain />
    </SmoothScrollProvider>
  )
}
