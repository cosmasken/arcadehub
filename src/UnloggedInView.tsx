import { Button } from "@/components/ui/button";
import { Gamepad, Trophy, Users, Code } from "lucide-react";
import { Link } from "react-router-dom";

const UnloggedInView = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
    <div className="max-w-2xl w-full px-6 py-12 bg-card rounded-xl shadow-lg border border-muted/20 flex flex-col items-center">
      <div className="flex items-center mb-6">
        <Gamepad size={48} className="text-arcade-yellow mr-3 animate-pulse-glow" />
        <h1 className="text-5xl font-bold text-gradient">ArcadeHub</h1>
      </div>
      <p className="text-lg text-white/80 mb-8 text-center">
        <span className="font-semibold text-arcade-yellow">Decentralized Gaming on the NERO Chain</span>
        <br />
        Play, earn ARC tokens and NFTs, and own your rewards. Developers upload games and earn revenue. Gasless, vibrant, and community-driven.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg border border-muted/30">
          <Trophy size={32} className="text-yellow-400 mb-2" />
          <h3 className="text-xl font-semibold mb-1">Play & Earn</h3>
          <p className="text-sm text-muted-foreground text-center">
            Enjoy arcade games, earn ARC tokens and NFT rewards for achievements.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg border border-muted/30">
          <Code size={32} className="text-arcade-purple mb-2" />
          <h3 className="text-xl font-semibold mb-1">Developer Ecosystem</h3>
          <p className="text-sm text-muted-foreground text-center">
            Upload your games, earn 70% revenue, and grow your audience.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg border border-muted/30">
          <Users size={32} className="text-arcade-blue mb-2" />
          <h3 className="text-xl font-semibold mb-1">Community</h3>
          <p className="text-sm text-muted-foreground text-center">
            Refer friends, join events, and unlock exclusive badges.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-muted rounded-lg border border-muted/30">
          <Gamepad size={32} className="text-arcade-yellow mb-2" />
          <h3 className="text-xl font-semibold mb-1">Gasless UX</h3>
          <p className="text-sm text-muted-foreground text-center">
            Play and upload games with no gas fees, powered by NERO’s Paymaster.
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
        <Button asChild className="bg-arcade-yellow text-black hover:bg-arcade-yellow/80 px-8 py-3 text-lg font-semibold w-full md:w-auto">
          <Link to="/">Explore Games</Link>
        </Button>
        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/5 px-8 py-3 text-lg font-semibold w-full md:w-auto">
          <Link to="/developers">For Developers</Link>
        </Button>
      </div>
    </div>
    <footer className="mt-12 text-sm text-white/50 text-center">
      &copy; {new Date().getFullYear()} ArcadeHub. All rights reserved.<br />
      <span className="text-xs">Powered by NERO Chain</span>
    </footer>
  </div>
);

export default UnloggedInView;