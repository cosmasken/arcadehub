import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../../hooks/use-supabase';

const upgrades = {
  1: { cost: 100, boost: 2 },
  2: { cost: 500, boost: 5 },
  3: { cost: 2000, boost: 10 }
};

const milestones = [10, 50, 100, 500, 1000];

const ClickerCanvas = ({ userId, arcBalance, setArcBalance }) => {
  const canvasRef = useRef(null);
  const [arcPerClick, setArcPerClick] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [sessionClicks, setSessionClicks] = useState(0);
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);

  // Draw game elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw crystal (central clickable)
    ctx.fillStyle = paused ? '#a1a1aa' : '#4F46E5';
    ctx.beginPath();
    ctx.moveTo(250, 100);
    ctx.lineTo(350, 150);
    ctx.lineTo(300, 250);
    ctx.lineTo(200, 250);
    ctx.lineTo(150, 150);
    ctx.closePath();
    ctx.fill();

    // Draw ARC counter
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`ARC: ${arcBalance}`, 20, 30);
    ctx.fillText(`Clicks: ${clicks}`, 20, 60);
    ctx.fillText(paused ? 'Paused' : 'Active', 20, 90);
  }, [arcBalance, clicks, paused]);

  // Handle click events
  const handleClick = async (e) => {
    if (paused) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is within crystal bounds
    if (x > 150 && x < 350 && y > 100 && y < 250) {
      const newBalance = arcBalance + arcPerClick;
      setArcBalance(newBalance);
      setClicks((c) => c + 1);
      setSessionClicks((c) => c + 1);

      // Record transaction in Supabase
      await supabase.from('transactions').insert({
        user_wallet: userId,
        type: 'earn',
        amount: arcPerClick
      });

      // Check achievements
      checkAchievements(newBalance);
    }
  };

  // Check for unlocked achievements
  const checkAchievements = async (balance) => {
    for (const milestone of milestones) {
      if (balance >= milestone && !unlockedMilestones.includes(milestone)) {
        // Find achievement by threshold
        const { data, error } = await supabase.from('achievements')
          .select('id')
          .eq('max_progress', milestone)
          .maybeSingle();
        if (data && data.id) {
          // Check if already unlocked
          const { data: userAch } = await supabase.from('user_achievements')
            .select('id')
            .eq('user_wallet', userId)
            .eq('achievement_id', data.id)
            .maybeSingle();
          if (!userAch) {
            await supabase.from('user_achievements').insert({
              user_wallet: userId,
              achievement_id: data.id,
              progress: milestone,
              unlocked: true,
              unlocked_at: new Date()
            });
            setUnlockedMilestones((prev) => [...prev, milestone]);
          }
        }
      }
    }
  };

  // Handle upgrades
  const buyUpgrade = async (level) => {
    const upgrade = upgrades[level];
    if (arcBalance >= upgrade.cost) {
      setArcPerClick((prev) => prev + upgrade.boost);
      setArcBalance((prev) => prev - upgrade.cost);
      await supabase.from('transactions').insert({
        user_wallet: userId,
        type: 'upgrade',
        amount: -upgrade.cost
      });
    }
  };

  // Pause/resume game
  const togglePause = () => setPaused((p) => !p);

  // Save session (e.g., on pause or manually)
  const saveSession = async () => {
    const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);
    await supabase.from('game_plays').insert({
      game_id: 'clicker',
      player_wallet: userId,
      played_at: new Date(),
      session_duration: sessionDuration,
      score: sessionClicks,
      device: 'web'
    });
    setSessionClicks(0);
    setSessionStart(Date.now());
  };

  return (
    <div className="game-container">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={400}
        onClick={handleClick}
        className="cursor-pointer"
        style={{ border: '2px solid #4F46E5', borderRadius: 8 }}
      />
      <div className="flex gap-4 mt-4">
        <button onClick={togglePause} className="px-4 py-2 bg-blue-600 text-white rounded">
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={saveSession} className="px-4 py-2 bg-green-600 text-white rounded">
          Save Session
        </button>
      </div>
      <div className="upgrades-panel mt-4">
        {Object.entries(upgrades).map(([level, {cost, boost}]) => (
          <button 
            key={level} 
            onClick={() => buyUpgrade(level)}
            disabled={arcBalance < cost}
            className="mr-2 px-3 py-1 bg-purple-600 text-white rounded disabled:opacity-50"
          >
            Upgrade: +{boost} ARC/click ({cost} ARC)
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClickerCanvas;