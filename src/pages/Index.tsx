
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/ui/HeroSection";
import GameGrid from "@/components/games/GameGrid";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-2">Popular Games</h2>
          <p className="text-white/70 mb-6">Explore our collection of games powered by NERO Chain</p>
        </div>
        <GameGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
