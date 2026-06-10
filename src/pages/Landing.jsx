import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import TrustedIndustries from "../components/landing/TrustedIndustries";
import ProblemSection from "../components/landing/ProblemSection";
import SolutionSection from "../components/landing/SolutionSection";
import ProcurementWorkflow from "../components/landing/ProcurementWorkflow";
import InventoryIntelligence from "../components/landing/InventoryIntelligence";
import ProductShowcase from "../components/landing/ProductShowcase";
import BusinessBenefits from "../components/landing/BusinessBenefits";
import PricingSection from "../components/landing/PricingSection";
import FAQSection from "../components/landing/FAQSection";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <TrustedIndustries />
      <ProblemSection />
      <SolutionSection />
      <ProcurementWorkflow />
      <InventoryIntelligence />
      <ProductShowcase />
      <BusinessBenefits />
      <PricingSection />
      <FAQSection />
      <CTA />
      <Footer />
    </div>
  );
}
