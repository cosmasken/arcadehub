import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GameUploadMock } from "@/components/games/GameUploadMock";

const GameUpload = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Upload Your Game</h1>
            <p className="text-muted-foreground mb-8">
              Upload your game files and deploy them to the ArcadeHub platform. Your game will be available to players worldwide.
            </p>
            <GameUploadMock />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GameUpload;
