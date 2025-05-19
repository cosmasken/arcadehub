
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Game } from "../games/GameCard";

// Sample featured games
const FEATURED_GAMES: Game[] = [
  {
    id: "star-blaster",
    title: "Star Blaster",
    thumbnail: "https://images.unsplash.com/photo-1538641297814-26eb2ae7b485?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Arcade",
    plays: 15432,
    rating: 4.5
  },
  {
    id: "puzzle-pop",
    title: "Puzzle Pop",
    thumbnail: "https://images.unsplash.com/photo-1536751048178-14c1807eb1a9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Puzzle",
    plays: 12050,
    rating: 4.8
  },
  {
    id: "turbo-dash",
    title: "Turbo Dash",
    thumbnail: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    genre: "Racing",
    plays: 8721,
    rating: 4.2
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % FEATURED_GAMES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-gradient-to-r from-arcade-purple to-arcade-pink overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              <span className="block mb-2">Play, Earn, Own!</span>
              <span className="text-arcade-yellow">Decentralized Gaming</span>
            </h1>
            
            <p className="text-white/80 text-lg md:text-xl max-w-md mx-auto md:mx-0 mb-6">
              Experience the future of gaming on the NERO Chain with ArcadeHub, 
              where players own their rewards and developers thrive.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                asChild
                size="lg" 
                className="bg-arcade-yellow text-black hover:bg-arcade-yellow/80 px-8 animate-pulse-glow"
              >
                <Link to="/games">Play Now</Link>
              </Button>
              
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link to="/developers">Develop Games</Link>
              </Button>
            </div>
          </div>
          
          {/* Featured Games Carousel */}
          <div className="relative h-[350px] md:h-[400px] w-full">
            {FEATURED_GAMES.map((game, index) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className={`
                  absolute inset-0 transition-all duration-500 overflow-hidden rounded-2xl border-2 border-white/20 neon-border
                  ${index === currentSlide ? 'opacity-100 z-20 scale-100' : 'opacity-0 z-10 scale-95'}
                `}
              >
                <img 
                  src={game.thumbnail} 
                  alt={game.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 md:p-6">
                  <span className="bg-arcade-yellow/90 text-black text-xs font-medium px-2 py-1 rounded-full mb-2 w-fit">
                    {game.genre}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{game.title}</h3>
                  <p className="text-white/80 text-sm">
                    {game.plays.toLocaleString()} Players • {game.rating} ★
                  </p>
                </div>
              </Link>
            ))}
            
            {/* Carousel indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
              {FEATURED_GAMES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white scale-110' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
