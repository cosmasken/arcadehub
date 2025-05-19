
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Maximize2, VolumeX, Volume2, Share2, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";

// Sample game data
const GAMES: Record<string, {
  title: string;
  description: string;
  genre: string;
  developer?: string;
  arcReward: number;
}> = {
  "star-blaster": {
    title: "Star Blaster",
    description: "Control a spaceship, shoot enemies and dodge asteroids in this fast-paced arcade shooter.",
    genre: "Arcade",
    arcReward: 50,
  },
  "puzzle-pop": {
    title: "Puzzle Pop",
    description: "Swap gems to clear boards in this addictive match-3 puzzle game.",
    genre: "Puzzle",
    arcReward: 30,
  },
  "turbo-dash": {
    title: "Turbo Dash",
    description: "Race cars on neon tracks, avoiding obstacles and competitors.",
    genre: "Racing",
    arcReward: 40,
  },
  "clicker-craze": {
    title: "Clicker Craze",
    description: "Click to collect coins, upgrade for more in this addictive idle game.",
    genre: "Idle",
    arcReward: 20,
  },
  "alien-quest": {
    title: "Alien Quest",
    description: "Navigate an alien through levels, collecting keys and avoiding traps.",
    genre: "Adventure",
    developer: "GameStudio",
    arcReward: 50,
  },
};

const GameView = () => {
  const { gameId } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  
  // Get game data
  const game = gameId && GAMES[gameId] ? GAMES[gameId] : {
    title: "Unknown Game",
    description: "This game does not exist.",
    genre: "Unknown",
    arcReward: 0,
  };

  // Placeholder game functions
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    toast(isFullscreen ? "Exited fullscreen mode" : "Entered fullscreen mode");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast(isMuted ? "Sound enabled" : "Sound muted");
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const earnReward = () => {
    toast.success(`+${game.arcReward} ARC Earned!`, {
      description: "Reward has been added to your balance",
      duration: 4000,
    });
  };

  // Simulate score increase
  useState(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setScore(prev => prev + Math.floor(Math.random() * 10));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  });

  return (
    <div className="relative min-h-screen bg-background pt-16">
      {/* Game Canvas Area */}
      <div className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-64px)]'}`}>
        {/* Mock Game Canvas */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className={`text-white text-2xl ${isPaused ? 'opacity-50' : 'opacity-100'}`}>
            {isPaused ? (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Game Paused</h2>
                <p className="mb-6">Press the play button to continue</p>
                <Button 
                  onClick={togglePause}
                  className="bg-arcade-blue hover:bg-arcade-blue/80"
                >
                  Resume Game
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-6xl font-bold mb-2 text-arcade-yellow animate-pulse-glow">
                  {game.title}
                </p>
                <p className="text-white/70">Game would render here using Pixi.js</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Game HUD */}
        <div className={`absolute inset-0 pointer-events-none ${isPaused ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
          {/* Top HUD */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center">
              <span className="w-4 h-4 bg-arcade-yellow rounded-full inline-block mr-2"></span>
              <span className="text-white font-medium">100 ARC</span>
            </div>
            
            <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-white font-medium">Score: {score}</span>
            </div>
          </div>
          
          {/* Bottom HUD */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 min-w-64">
            <div className="bg-black/50 backdrop-blur-sm p-2 rounded-lg text-center">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-arcade-blue rounded-full"
                  style={{ width: `${(score / 500) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-white/80 mt-1">
                {game.arcReward} ARC for Win ({Math.min(Math.round((score / 500) * 100), 100)}%)
              </p>
            </div>
          </div>
        </div>
        
        {/* Game Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleMute}
            className="bg-black/50 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 pointer-events-auto"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleFullscreen}
            className="bg-black/50 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 pointer-events-auto"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Maximize2 size={20} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={togglePause}
            className="bg-black/50 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 pointer-events-auto"
            aria-label={isPaused ? "Resume" : "Pause"}
          >
            <XCircle size={20} />
          </Button>
        </div>
        
        {/* Return to Home */}
        <div className="absolute bottom-4 left-4 z-10">
          <Button 
            asChild
            variant="outline" 
            size="sm" 
            className="bg-black/50 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 pointer-events-auto"
          >
            <Link to="/">
              <ArrowLeft size={16} className="mr-1" />
              Exit Game
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Pause Menu */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="bg-secondary rounded-xl border border-muted/20 p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center">{game.title}</h2>
            
            <div className="space-y-3 mb-6">
              <Button
                onClick={togglePause}
                className="w-full bg-arcade-blue hover:bg-arcade-blue/80"
              >
                Resume
              </Button>
              
              <Button
                onClick={() => {
                  setScore(0);
                  togglePause();
                }}
                variant="outline"
                className="w-full border-white/20 hover:bg-white/5"
              >
                Restart
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full border-white/20 hover:bg-white/5"
              >
                <Link to="/">
                  Exit
                </Link>
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-arcade-yellow text-black hover:bg-arcade-yellow/80"
              >
                <Share2 size={16} className="mr-1.5" />
                Share Score
              </Button>
              
              <Button
                onClick={earnReward}
                className="flex-1 bg-arcade-pink hover:bg-arcade-pink/80"
              >
                <Trophy size={16} className="mr-1.5" />
                Claim Rewards
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameView;
