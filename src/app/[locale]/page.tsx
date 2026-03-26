import Header from "@/components/Header";
import HeroShowreel from "@/components/HeroShowreel";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import ReelsGrid from "@/components/ReelsGrid";
import LyonCourt from "@/components/LyonCourt";
import StatsDashboard from "@/components/StatsDashboard";
import ClientsCarousel from "@/components/ClientsCarousel";
import PressSection from "@/components/PressSection";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroShowreel />
        <Hero />
        <Services />
        <ReelsGrid />
        <LyonCourt />
        <StatsDashboard />
        <ClientsCarousel />
        <PressSection />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
