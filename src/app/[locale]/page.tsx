import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ReelsGrid from "@/components/ReelsGrid";
import StatsDashboard from "@/components/StatsDashboard";
import ClientsCarousel from "@/components/ClientsCarousel";
import PimpMyCourt from "@/components/PimpMyCourt";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ReelsGrid />
        <StatsDashboard />
        <ClientsCarousel />
        <PimpMyCourt />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
