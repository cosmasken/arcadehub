// import React, { useState, useEffect, useRef, useCallback } from "react";
// import { ethers } from "ethers";
// import { CONTRACT_ADDRESSES } from "@/config";
// import { getArcadeHubContract } from "@/lib/contractUtils";
// import { useAAWallet } from "@/hooks/useAAWallet";
// import { useRewardsStore } from "@/hooks/use-rewards";
// import Navbar from "@/components/layout/Navbar";
// import Footer from "@/components/layout/Footer";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CoinsIcon, Star, Zap, Flame, Crosshair, Rocket } from "lucide-react";
// import { toast } from "sonner";
// import { Progress } from "@/components/ui/progress";
// import { Loader2 } from "lucide-react";

// interface Achievement {
//   id: number;
//   name: string;
//   description: string;
//   requirement: number;
//   type: 'kills' | 'survival' | 'accuracy';
//   unlocked: boolean;
//   reward: number;
// }

// interface Position {
//   x: number;
//   y: number;
// }

// const SPACE_SHOOTER_CONFIG = {
//   width: 600,
//   height: 400,
//   playerSpeed: 8,
//   bulletSpeed: 10,
//   enemySpeed: 3,
//   spawnRate: 1500,
//   hitboxSize: 20
// };

// const SpaceShooter = () => {
//   const { aaWallet, aaSigner, refreshBalance } = useAAWallet();
//   const { addReward, setTotals } = useRewardsStore();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
  
//   // Game State
//   const [playerPos, setPlayerPos] = useState<Position>({ x: 300, y: 350 });
//   const [bullets, setBullets] = useState<Position[]>([]);
//   const [enemies, setEnemies] = useState<Position[]>([]);
//   const [score, setScore] = useState(0);
//   const [lives, setLives] = useState(3);
//   const [arcPoints, setArcPoints] = useState(0);
//   const [totalEarned, setTotalEarned] = useState(0);
//   const [isFiring, setIsFiring] = useState(false);
//   const [timeAlive, setTimeAlive] = useState(0);
//   const [shotsFired, setShotsFired] = useState(0);
//   const [shotsHit, setShotsHit] = useState(0);
  
//   // Achievements
//   const [achievements, setAchievements] = useState<Achievement[]>([
//     {
//       id: 1,
//       name: "First Blood",
//       description: "Destroy 10 enemies",
//       requirement: 10,
//       type: 'kills',
//       unlocked: false,
//       reward: 50
//     },
//     {
//       id: 2,
//       name: "Survivor",
//       description: "Survive 60 seconds",
//       requirement: 60,
//       type: 'survival',
//       unlocked: false,
//       reward: 100
//     },
//     {
//       id: 3,
//       name: "Sharpshooter",
//       description: "80% accuracy",
//       requirement: 80,
//       type: 'accuracy',
//       unlocked: false,
//       reward: 150
//     }
//   ]);

//   // Game Loop
//   const gameLoop = useCallback(() => {
//     setBullets(b => 
//       b.filter(bullet => bullet.y > 0)
//        .map(bullet => ({ ...bullet, y: bullet.y - SPACE_SHOOTER_CONFIG.bulletSpeed }))
//     );

//     setEnemies(e => 
//       e.filter(enemy => enemy.y < SPACE_SHOOTER_CONFIG.height)
//        .map(enemy => ({ ...enemy, y: enemy.y + SPACE_SHOOTER_CONFIG.enemySpeed }))
//     );

//     // Collision detection
//     enemies.forEach((enemy, eIndex) => {
//       bullets.forEach((bullet, bIndex) => {
//         const distance = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
//         if (distance < SPACE_SHOOTER_CONFIG.hitboxSize) {
//           setEnemies(e => e.filter((_, i) => i !== eIndex));
//           setBullets(b => b.filter((_, i) => i !== bIndex));
//           setScore(s => s + 100);
//           setArcPoints(p => p + 10);
//           setTotalEarned(t => t + 10);
//           setShotsHit(h => h + 1);
//         }
//       });

//       const playerDistance = Math.hypot(playerPos.x - enemy.x, playerPos.y - enemy.y);
//       if (playerDistance < SPACE_SHOOTER_CONFIG.hitboxSize) {
//         setEnemies(e => e.filter((_, i) => i !== eIndex));
//         setLives(l => l - 1);
//       }
//     });
//   }, [enemies, bullets, playerPos]);

//   // Input Handling
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch(e.key) {
//         case 'ArrowLeft':
//           setPlayerPos(p => ({ ...p, x: Math.max(20, p.x - SPACE_SHOOTER_CONFIG.playerSpeed }));
//           break;
//         case 'ArrowRight':
//           setPlayerPos(p => ({ ...p, x: Math.min(SPACE_SHOOTER_CONFIG.width - 20, p.x + SPACE_SHOOTER_CONFIG.playerSpeed }));
//           break;
//         case ' ':
//           if (!isFiring) {
//             setBullets(b => [...b, { x: playerPos.x, y: playerPos.y }]);
//             setShotsFired(f => f + 1);
//             setIsFiring(true);
//           }
//           break;
//       }
//     };

//     const handleKeyUp = (e: KeyboardEvent) => {
//       if (e.key === ' ') setIsFiring(false);
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//     };
//   }, [isFiring, playerPos]);

//   // Game Timing
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas?.getContext('2d');
//     if (!ctx) return;

//     const enemyInterval = setInterval(() => {
//       setEnemies(e => [...e, { 
//         x: Math.random() * (SPACE_SHOOTER_CONFIG.width - 40) + 20,
//         y: -20
//       }]);
//     }, SPACE_SHOOTER_CONFIG.spawnRate);

//     const loopInterval = setInterval(() => {
//       ctx.clearRect(0, 0, SPACE_SHOOTER_CONFIG.width, SPACE_SHOOTER_CONFIG.height);
      
//       // Draw player
//       ctx.fillStyle = '#4CAF50';
//       ctx.fillRect(playerPos.x - 15, playerPos.y - 10, 30, 20);

//       // Draw bullets
//       ctx.fillStyle = '#FFEB3B';
//       bullets.forEach(bullet => {
//         ctx.fillRect(bullet.x - 2, bullet.y - 5, 4, 10);
//       });

//       // Draw enemies
//       ctx.fillStyle = '#F44336';
//       enemies.forEach(enemy => {
//         ctx.fillRect(enemy.x - 15, enemy.y - 10, 30, 20);
//       });

//       gameLoop();
//     }, 1000/60);

//     const survivalTimer = setInterval(() => {
//       setTimeAlive(t => t + 1);
//     }, 1000);

//     return () => {
//       clearInterval(enemyInterval);
//       clearInterval(loopInterval);
//       clearInterval(survivalTimer);
//     };
//   }, [gameLoop, bullets, enemies, playerPos]);

//   // Game Over
//   useEffect(() => {
//     if (lives <= 0) {
//       toast.error("Game Over!", { 
//         description: `Final Score: ${score} | Accuracy: ${Math.round((shotsHit / shotsFired) * 100 || 0}%`
//       });
//       setLives(3);
//       setScore(0);
//       setTimeAlive(0);
//       setShotsFired(0);
//       setShotsHit(0);
//     }
//   }, [lives, score, shotsHit, shotsFired]);

//   // Achievements
//   useEffect(() => {
//     const newAchievements = [...achievements];
//     let updated = false;
//     const accuracy = Math.round((shotsHit / shotsFired) * 100) || 0;

//     newAchievements.forEach(achievement => {
//       if (achievement.unlocked) return;

//       let requirementMet = false;
//       switch(achievement.type) {
//         case 'kills':
//           requirementMet = shotsHit >= achievement.requirement;
//           break;
//         case 'survival':
//           requirementMet = timeAlive >= achievement.requirement;
//           break;
//         case 'accuracy':
//           requirementMet = accuracy >= achievement.requirement;
//           break;
//       }

//       if (requirementMet) {
//         achievement.unlocked = true;
//         setArcPoints(p => p + achievement.reward);
//         setTotalEarned(t => t + achievement.reward);
//         updated = true;
//         toast.success(`Achievement Unlocked: ${achievement.name}!`);
//       }
//     });

//     if (updated) setAchievements(newAchievements);
//   }, [shotsHit, timeAlive, shotsFired]);

//   const handleClaimEarnings = async () => {
//     if (!aaSigner || !arcPoints || isSubmitting) return;
    
//     setIsSubmitting(true);
//     try {
//       const contract = getArcadeHubContract(aaSigner);
//       const tx = await contract.recordGameEarnings(arcPoints);
//       await tx.wait();
      
//       setArcPoints(0);
//       addReward({
//         id: Date.now(),
//         date: new Date().toISOString().split('T')[0],
//         game: "Space Shooter",
//         type: "Earn",
//         amount: arcPoints
//       });
//       await refreshBalance();
//       toast.success("Earnings claimed successfully!");
//     } catch (error) {
//       console.error("Error claiming earnings:", error);
//       toast.error("Failed to claim earnings");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-background text-foreground">
//       <Navbar />
//       <main className="flex-grow pt-16">
//         <div className="container mx-auto px-4 py-8">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold mb-2">ARC Space Defender</h1>
//             <p className="text-muted-foreground">Destroy enemies to earn tokens!</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
//             {/* Stats Card */}
//             <Card className="md:col-span-3">
//               <CardHeader>
//                 <CardTitle>Battle Stats</CardTitle>
//                 <CardDescription>Combat Performance</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">Score:</span>
//                   <span className="font-bold flex items-center">
//                     <Zap className="w-4 h-4 mr-1 text-yellow-500" />
//                     {score}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">Lives:</span>
//                   <span className="font-bold flex items-center">
//                     <Crosshair className="w-4 h-4 mr-1 text-red-500" />
//                     {lives}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">ARC Earned:</span>
//                   <span className="font-bold flex items-center">
//                     <CoinsIcon className="w-4 h-4 mr-1 text-yellow-500" />
//                     {totalEarned}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-muted-foreground">Accuracy:</span>
//                   <span className="font-bold">
//                     {Math.round((shotsHit / shotsFired) * 100 || 0}%
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Game Area */}
//             <Card className="md:col-span-6">
//               <CardHeader>
//                 <CardTitle className="text-center">
//                   {lives > 0 ? "Battle Zone" : "Game Over!"}
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="flex justify-center py-8">
//                 <canvas
//                   ref={canvasRef}
//                   width={SPACE_SHOOTER_CONFIG.width}
//                   height={SPACE_SHOOTER_CONFIG.height}
//                   className="border-2 border-muted rounded-lg bg-black"
//                 />
//               </CardContent>
//               <CardFooter className="flex flex-col gap-4">
//                 <div className="text-sm text-muted-foreground text-center">
//                   Use ← → to move | SPACE to fire
//                 </div>
//                 {aaSigner && (
//                   <Button
//                     onClick={handleClaimEarnings}
//                     disabled={isSubmitting || arcPoints === 0}
//                     className="w-full bg-arcade-yellow hover:bg-arcade-yellow/80 text-black"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Claiming...
//                       </>
//                     ) : (
//                       <>
//                         <CoinsIcon className="mr-2 h-4 w-4" />
//                         Claim {arcPoints} ARC
//                       </>
//                     )}
//                   </Button>
//                 )}
//               </CardFooter>
//             </Card>

//             {/* Achievements */}
//             <Card className="md:col-span-3">
//               <CardHeader>
//                 <CardTitle>Achievements</CardTitle>
//                 <CardDescription>Combat Milestones</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
//                 {achievements.map((achievement) => (
//                   <div key={achievement.id} className={`border ${achievement.unlocked ? 
//                     'border-arcade-yellow bg-secondary/30' : 'border-muted'} p-3 rounded-lg`}>
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-medium flex items-center">
//                         {achievement.unlocked && 
//                           <Star className="w-4 h-4 mr-1 text-arcade-yellow" fill="currentColor" />}
//                         {achievement.name}
//                       </h3>
//                       <span className={`text-xs px-2 py-1 rounded ${
//                         achievement.unlocked ? 'bg-arcade-yellow text-black' : 'bg-muted'
//                       }`}>
//                         {achievement.unlocked ? 'Unlocked' : 'Locked'}
//                       </span>
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       {achievement.description}
//                     </p>
//                     {!achievement.unlocked && (
//                       <div className="mt-2">
//                         <Progress
//                           value={
//                             achievement.type === 'kills' ? (shotsHit / achievement.requirement) * 100 :
//                             achievement.type === 'survival' ? (timeAlive / achievement.requirement) * 100 :
//                             (Math.round((shotsHit / shotsFired) * 100) / achievement.requirement) * 100
//                           }
//                           className="h-1"
//                         />
//                         <div className="text-xs text-muted-foreground mt-1 text-right">
//                           {Math.floor(
//                             achievement.type === 'kills' ? (shotsHit / achievement.requirement) * 100 :
//                             achievement.type === 'survival' ? (timeAlive / achievement.requirement) * 100 :
//                             (Math.round((shotsHit / shotsFired) * 100) / achievement.requirement) * 100
//                           )}%
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default SpaceShooter;