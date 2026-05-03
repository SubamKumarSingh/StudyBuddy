import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import HeroSection from "../components/landing/HeroSection";
import FeatureSection from "../components/landing/FeatureSection";
import Workflow from "../components/landing/Workflow";

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_35%),linear-gradient(180deg,#fffaf4_0%,#fff_48%,#fff8f1_100%)] text-slate-950">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <HeroSection />
        <FeatureSection />
        <Workflow />
        <Footer />
      </main>
    </div>
  );
}
