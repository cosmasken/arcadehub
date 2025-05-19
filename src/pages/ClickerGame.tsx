
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CoinsIcon, Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface Upgrade {
  id: number;
  name: string;
  description: string;
  cost: number;
  arcPerClick: number;
  owned: number;
}

interface AutoUpgrade {
  id: number;
  name: string;
  description: string;
  cost: number;
  arcPerSecond: number;
  owned: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  requirement: number;
  type: 'clicks' | 'points' | 'upgrades';
  unlocked: boolean;
  reward: number;
}

const ClickerGame = () => {
  const [arcPoints, setArcPoints] = useState(0);
  const [arcPerClick, setArcPerClick] = useState(1);
  const [clickCount, setClickCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [arcPerSecond, setArcPerSecond] = useState(0);
  const [lastTick, setLastTick] = useState(Date.now());
  
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: 1,
      name: "Basic Clicker",
      description: "Increases ARC per click by 1",
      cost: 10,
      arcPerClick: 1,
      owned: 0
    },
    {
      id: 2,
      name: "Advanced Clicker",
      description: "Increases ARC per click by 5",
      cost: 50,
      arcPerClick: 5,
      owned: 0
    },
    {
      id: 3,
      name: "Super Clicker",
      description: "Increases ARC per click by 20",
      cost: 200,
      arcPerClick: 20,
      owned: 0
    }
  ]);
  
  const [autoUpgrades, setAutoUpgrades] = useState<AutoUpgrade[]>([
    {
      id: 1,
      name: "Auto-Clicker",
      description: "Generates 1 ARC per second automatically",
      cost: 30,
      arcPerSecond: 1,
      owned: 0
    },
    {
      id: 2,
      name: "ARC Miner",
      description: "Generates 5 ARC per second automatically",
      cost: 150,
      arcPerSecond: 5,
      owned: 0
    },
    {
      id: 3,
      name: "ARC Factory",
      description: "Generates 20 ARC per second automatically",
      cost: 500,
      arcPerSecond: 20,
      owned: 0
    }
  ]);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 1,
      name: "Beginner Clicker",
      description: "Click 10 times",
      requirement: 10,
      type: 'clicks',
      unlocked: false,
      reward: 5
    },
    {
      id: 2,
      name: "Dedicated Clicker",
      description: "Click 50 times",
      requirement: 50,
      type: 'clicks',
      unlocked: false,
      reward: 25
    },
    {
      id: 3,
      name: "Click Master",
      description: "Click 100 times",
      requirement: 100,
      type: 'clicks',
      unlocked: false,
      reward: 50
    },
    {
      id: 4,
      name: "ARC Collector",
      description: "Earn 500 ARC in total",
      requirement: 500,
      type: 'points',
      unlocked: false,
      reward: 100
    },
    {
      id: 5,
      name: "ARC Hoarder",
      description: "Earn 2000 ARC in total",
      requirement: 2000,
      type: 'points',
      unlocked: false,
      reward: 250
    }
  ]);
  
  // Auto-generate ARC points
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - lastTick) / 1000; // Convert to seconds
      
      if (arcPerSecond > 0) {
        const earned = arcPerSecond * deltaTime;
        setArcPoints(prev => prev + earned);
        setTotalEarned(prev => prev + earned);
      }
      
      setLastTick(now);
    }, 100);
    
    return () => clearInterval(interval);
  }, [arcPerSecond, lastTick]);
  
  // Check achievements
  useEffect(() => {
    const newAchievements = [...achievements];
    let updated = false;
    
    newAchievements.forEach(achievement => {
      if (achievement.unlocked) return;
      
      let requirement = false;
      
      switch (achievement.type) {
        case 'clicks':
          requirement = clickCount >= achievement.requirement;
          break;
        case 'points':
          requirement = totalEarned >= achievement.requirement;
          break;
        case 'upgrades':
          const totalUpgrades = upgrades.reduce((sum, upg) => sum + upg.owned, 0) + 
                               autoUpgrades.reduce((sum, upg) => sum + upg.owned, 0);
          requirement = totalUpgrades >= achievement.requirement;
          break;
      }
      
      if (requirement) {
        achievement.unlocked = true;
        setArcPoints(prev => prev + achievement.reward);
        setTotalEarned(prev => prev + achievement.reward);
        updated = true;
        
        toast.success(`Achievement Unlocked: ${achievement.name}!`, {
          description: `Reward: ${achievement.reward} ARC`,
        });
      }
    });
    
    if (updated) {
      setAchievements(newAchievements);
    }
  }, [clickCount, totalEarned, upgrades, autoUpgrades]);

  // Handle clicking the main button
  const handleClick = () => {
    const earned = arcPerClick;
    setArcPoints(prev => prev + earned);
    setTotalEarned(prev => prev + earned);
    setClickCount(prev => prev + 1);
  };

  // Purchase an upgrade
  const purchaseUpgrade = (id: number) => {
    const upgradeIndex = upgrades.findIndex(upgrade => upgrade.id === id);
    if (upgradeIndex === -1) return;

    const upgrade = upgrades[upgradeIndex];
    
    if (arcPoints >= upgrade.cost) {
      // Calculate new ARC per click
      const newArcPerClick = arcPerClick + upgrade.arcPerClick;
      
      // Update upgrade count
      const newUpgrades = [...upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        owned: upgrade.owned + 1,
        cost: Math.round(upgrade.cost * 1.5) // Increase cost for next purchase
      };
      
      // Update state
      setArcPoints(prev => prev - upgrade.cost);
      setArcPerClick(newArcPerClick);
      setUpgrades(newUpgrades);
      
      toast.success(`Upgraded: ${upgrade.name}`, {
        description: `You now earn ${newArcPerClick} ARC per click!`,
      });
    } else {
      toast.error("Not enough ARC points!", {
        description: `You need ${upgrade.cost - arcPoints} more ARC to purchase this upgrade.`,
      });
    }
  };
  
  // Purchase an auto upgrade
  const purchaseAutoUpgrade = (id: number) => {
    const upgradeIndex = autoUpgrades.findIndex(upgrade => upgrade.id === id);
    if (upgradeIndex === -1) return;
    
    const upgrade = autoUpgrades[upgradeIndex];
    
    if (arcPoints >= upgrade.cost) {
      // Calculate new ARC per second
      const newArcPerSecond = arcPerSecond + upgrade.arcPerSecond;
      
      // Update upgrade count
      const newAutoUpgrades = [...autoUpgrades];
      newAutoUpgrades[upgradeIndex] = {
        ...upgrade,
        owned: upgrade.owned + 1,
        cost: Math.round(upgrade.cost * 1.5) // Increase cost for next purchase
      };
      
      // Update state
      setArcPoints(prev => prev - upgrade.cost);
      setArcPerSecond(newArcPerSecond);
      setAutoUpgrades(newAutoUpgrades);
      
      toast.success(`Purchased: ${upgrade.name}`, {
        description: `You now generate ${newArcPerSecond} ARC per second!`,
      });
    } else {
      toast.error("Not enough ARC points!", {
        description: `You need ${upgrade.cost - arcPoints} more ARC to purchase this upgrade.`,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Clicker Craze</h1>
            <p className="text-muted-foreground">Click to earn ARC tokens!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Stats Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Stats</CardTitle>
                <CardDescription>Your progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total ARC:</span>
                  <span className="font-bold text-xl flex items-center">
                    <CoinsIcon className="w-5 h-5 mr-1 text-yellow-500" />
                    {Math.floor(arcPoints)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ARC per click:</span>
                  <span className="font-bold">{arcPerClick}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ARC per second:</span>
                  <span className="font-bold">{arcPerSecond}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total clicks:</span>
                  <span className="font-bold">{clickCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total earned:</span>
                  <span className="font-bold">{Math.floor(totalEarned)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Main Clicker Area */}
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle className="text-center">Click Me!</CardTitle>
                <CardDescription className="text-center">Earn ARC with each click</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-8">
                <button 
                  onClick={handleClick}
                  className="w-40 h-40 rounded-full bg-primary/20 border-4 border-primary hover:bg-primary/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                  <div className="text-center">
                    <CoinsIcon className="w-16 h-16 mx-auto text-yellow-500 animate-bounce-subtle" />
                    <span className="block mt-2 text-lg font-bold text-primary">+{arcPerClick} ARC</span>
                  </div>
                </button>
              </CardContent>
              <CardFooter className="flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground mb-2">Auto-generating {arcPerSecond} ARC per second</p>
                <Progress value={(arcPerSecond > 0 ? (Date.now() % 1000) / 10 : 0)} className="w-full h-1" />
              </CardFooter>
            </Card>

            {/* Achievements */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Complete goals to earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`border ${achievement.unlocked ? 'border-arcade-yellow bg-secondary/30' : 'border-muted'} rounded-lg p-3`}>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium flex items-center">
                        {achievement.unlocked && (
                          <Star className="w-4 h-4 mr-1 text-arcade-yellow" fill="currentColor" />
                        )}
                        {achievement.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${achievement.unlocked ? 'bg-arcade-yellow text-black' : 'bg-muted'}`}>
                        {achievement.unlocked ? 'Completed' : 'Locked'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <Progress
                          value={
                            achievement.type === 'clicks'
                              ? (clickCount / achievement.requirement) * 100
                              : achievement.type === 'points'
                              ? (totalEarned / achievement.requirement) * 100
                              : 0
                          }
                          className="h-1"
                        />
                        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {achievement.type === 'clicks'
                              ? `${clickCount}/${achievement.requirement} clicks`
                              : achievement.type === 'points'
                              ? `${Math.floor(totalEarned)}/${achievement.requirement} ARC`
                              : '0%'}
                          </span>
                        </div>
                      </div>
                    )}
                    {achievement.unlocked && (
                      <div className="flex items-center mt-2 text-xs text-arcade-yellow">
                        <CoinsIcon className="w-3 h-3 mr-1" />
                        <span>Rewarded: {achievement.reward} ARC</span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Click Upgrades */}
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle>Click Upgrades</CardTitle>
                <CardDescription>Increase ARC per click</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {upgrades.map((upgrade) => (
                  <div key={upgrade.id} className="border border-muted rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{upgrade.name}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Owned: {upgrade.owned}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{upgrade.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center text-sm">
                        <CoinsIcon className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                        {upgrade.cost}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => purchaseUpgrade(upgrade.id)}
                        disabled={arcPoints < upgrade.cost}
                        className={arcPoints < upgrade.cost ? "opacity-50" : ""}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Auto Upgrades */}
            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle>Auto Upgrades</CardTitle>
                <CardDescription>Generate ARC automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {autoUpgrades.map((upgrade) => (
                  <div key={upgrade.id} className="border border-muted rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{upgrade.name}</h3>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Owned: {upgrade.owned}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{upgrade.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="flex items-center text-sm">
                        <CoinsIcon className="w-3.5 h-3.5 mr-1 text-yellow-500" />
                        {upgrade.cost}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => purchaseAutoUpgrade(upgrade.id)}
                        disabled={arcPoints < upgrade.cost}
                        className={arcPoints < upgrade.cost ? "opacity-50" : ""}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Buy
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClickerGame;
