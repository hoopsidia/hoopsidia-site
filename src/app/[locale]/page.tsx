import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ReelsGrid from "@/components/ReelsGrid";
import LyonCourt from "@/components/LyonCourt";
import StatsDashboard from "@/components/StatsDashboard";
import ClientsCarousel from "@/components/ClientsCarousel";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ReelsGrid />
        <LyonCourt />
        <StatsDashboard />
        <ClientsCarousel />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
