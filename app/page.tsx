import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import ProductStory from "@/components/landing/ProductStory";
import GoogleDestination from "@/components/landing/GoogleDestination";
import Metrics from "@/components/landing/Metrics";
import Places from "@/components/landing/Places";
import AboutCTA from "@/components/landing/AboutCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <ProductStory />
        <GoogleDestination />
        <Metrics />
        <Places />
        <AboutCTA />
      </main>

      <Footer />
    </>
  );
}
