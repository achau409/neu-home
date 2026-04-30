import PromoBanner from "@/components/sections/PromoBanner";
import TopNav from "@/components/sections/TopNav";
import Hero from "@/components/sections/Hero";
import WizardCard from "@/components/sections/WizardCard";
import PainPoints from "@/components/sections/PainPoints";
import HowItWorks from "@/components/sections/HowItWorks";
import BeforeAfterSection from "@/components/sections/BeforeAfterSection";
import Included from "@/components/sections/Included";
import Reviews from "@/components/sections/Reviews";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";
import StickyCTA from "@/components/sections/StickyCTA";
import "./test.css"

export default function HomePage() {
  return (
    <main className="page">
      <TopNav />
      <Hero />
      <WizardCard />
      <PainPoints />
      <HowItWorks />
      <BeforeAfterSection />
      <Included />
      <Reviews />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </main>
  );
}
