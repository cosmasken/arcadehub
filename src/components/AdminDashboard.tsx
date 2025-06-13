/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { TESTNET_CONFIG } from '../config';
import LoadingModal from '../components/LoadingModal';
import { Slider } from './ui/slider';
import {
  Shield,
  Coins,
  Users,
  Gamepad2,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  UserPlus,
  Settings,
  DollarSign,
} from 'lucide-react';
import PointsSystem from '../abi/PointsSystem.json';
import TokenSelector from './TokenSelector';
import { ethers } from 'ethers';
import { approvePointsClaimAA, rejectPointsClaimAA, getProvider, setPointsToTokensRateAA, addAdminAA, removeAdminAA } from '../lib/aaUtils';
import { useWalletStore } from '../stores/useWalletStore';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'claims' | 'games' | 'admins' | 'balance'>('claims');
  const { toast } = useToast();
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [loadingClaim, setLoadingClaim] = useState<string | null>(null);
  const { aaSigner } = useWalletStore();
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [loadingModalText, setLoadingModalText] = useState<string | undefined>(undefined);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [gasMultiplier, setGasMultiplier] = useState([1.5]);
  const [newAdminAddress, setNewAdminAddress] = useState<string>('');
  const [pointsToTokensRate, setPointsToTokensRate] = useState<number>(1000);
  const [newRate, setNewRate] = useState<string>('1000');

  const gasMultiplierPercent = Math.round(gasMultiplier[0] * 100);
  const clampedGasMultiplier = Math.max(50, Math.min(500, gasMultiplierPercent));

  const provider = getProvider();
  const contract = new ethers.Contract(TESTNET_CONFIG.smartContracts.pointsSystem, PointsSystem, provider);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch pending claims
      const submitted = (await contract.queryFilter(contract.filters.PointsClaimSubmitted()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
      const approved = (await contract.queryFilter(contract.filters.PointsClaimApproved()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
      const rejected = (await contract.queryFilter(contract.filters.PointsClaimRejected()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
      const processed = new Set([
        ...approved.map(e => e.args.player.toLowerCase()),
        ...rejected.map(e => e.args.player.toLowerCase()),
      ]);
      const pending = submitted
        .filter(e => !processed.has(e.args.player.toLowerCase()))
        .map(e => ({
          player: e.args.player,
          points: Number(e.args.points),
          blockNumber: e.blockNumber,
        }));
      setPendingClaims(pending);

      // Fetch contract balance
      const balance = await contract.getContractTokenBalance();
      const tokenContract = new ethers.Contract(await contract.arcToken(), ['function decimals() view returns (uint8)'], provider);
      const decimals = await tokenContract.decimals();
      setContractBalance(ethers.formatUnits(balance, decimals));

      // Fetch admins (via AdminAdded events, assuming initial owner is admin)
      const adminAdded = (await contract.queryFilter(contract.filters.AdminAdded()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
      const adminRemoved = (await contract.queryFilter(contract.filters.AdminRemoved()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
      const activeAdmins = new Set(adminAdded.map(e => e.args.admin.toLowerCase()));
      adminRemoved.forEach(e => activeAdmins.delete(e.args.admin.toLowerCase()));
      setAdmins(Array.from(activeAdmins).map(addr => ({ address: addr, role: 'Administrator' })));

      // Fetch pointsToTokensRate
      const rate = await contract.pointsToTokensRate();
      setPointsToTokensRate(Number(rate));

      // Fetch recent activities (TokensClaimed, TokensDeposited)
      const tokensClaimed = (await contract.queryFilter(contract.filters.TokensClaimed()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e)
        .map(e => ({
          type: 'TokensClaimed',
          player: e.args.player,
          amount: ethers.formatUnits(e.args.amount, decimals),
          blockNumber: e.blockNumber,
        }));
      const tokensDeposited = (await contract.queryFilter(contract.filters.TokensDeposited()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e)
        .map(e => ({
          type: 'TokensDeposited',
          owner: e.args.owner,
          amount: ethers.formatUnits(e.args.amount, decimals),
          blockNumber: e.blockNumber,
        }));
      setRecentActivities([...tokensClaimed, ...tokensDeposited].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 10));
    } catch (err) {
      console.error('Error fetching initial data:', err);
      toast({ title: 'Error', description: 'Failed to fetch data.', variant: 'destructive' });
    }
  }, [contract, provider, toast]);

  // Setup event listeners
  useEffect(() => {
    fetchInitialData();

    // Real-time event listeners
    const handlePointsClaimSubmitted = (player: string, points: ethers.BigNumberish) => {
      setPendingClaims(prev => {
        if (prev.some(claim => claim.player.toLowerCase() === player.toLowerCase())) return prev;
        return [...prev, { player, points: Number(points), blockNumber: 0 }];
      });
      toast({ title: 'New Claim', description: `${player} submitted ${points} points.` });
    };
    const handlePointsClaimApproved = (player: string, points: ethers.BigNumberish) => {
      setPendingClaims(prev => prev.filter(claim => claim.player.toLowerCase() !== player.toLowerCase()));
      toast({ title: 'Claim Approved', description: `${player}'s ${points} points approved.` });
    };
    const handlePointsClaimRejected = (player: string) => {
      setPendingClaims(prev => prev.filter(claim => claim.player.toLowerCase() !== player.toLowerCase()));
      toast({ title: 'Claim Rejected', description: `${player}'s claim rejected.` });
    };
    const handleTokensClaimed = (player: string, amount: ethers.BigNumberish) => {
      contract.getContractTokenBalance().then(balance => {
        contract.arcToken().then(tokenAddress => {
          const tokenContract = new ethers.Contract(tokenAddress, ['function decimals() view returns (uint8)'], provider);
          tokenContract.decimals().then(decimals => {
            setContractBalance(ethers.formatUnits(balance, decimals));
            setRecentActivities(prev => [
              { type: 'TokensClaimed', player, amount: ethers.formatUnits(amount, decimals), blockNumber: 0 },
              ...prev.slice(0, 9),
            ]);
            toast({ title: 'Tokens Claimed', description: `${player} claimed ${ethers.formatUnits(amount, decimals)} ARC.` });
          });
        });
      });
    };
    const handleTokensDeposited = (owner: string, amount: ethers.BigNumberish) => {
      contract.getContractTokenBalance().then(balance => {
        contract.arcToken().then(tokenAddress => {
          const tokenContract = new ethers.Contract(tokenAddress, ['function decimals() view returns (uint8)'], provider);
          tokenContract.decimals().then(decimals => {
            setContractBalance(ethers.formatUnits(balance, decimals));
            setRecentActivities(prev => [
              { type: 'TokensDeposited', owner, amount: ethers.formatUnits(amount, decimals), blockNumber: 0 },
              ...prev.slice(0, 9),
            ]);
            toast({ title: 'Tokens Deposited', description: `${owner} deposited ${ethers.formatUnits(amount, decimals)} ARC.` });
          });
        });
      });
    };
    const handleAdminAdded = (admin: string) => {
      setAdmins(prev => {
        if (prev.some(a => a.address.toLowerCase() === admin.toLowerCase())) return prev;
        return [...prev, { address: admin, role: 'Administrator' }];
      });
      toast({ title: 'Admin Added', description: `${admin} added as admin.` });
    };
    const handleAdminRemoved = (admin: string) => {
      setAdmins(prev => prev.filter(a => a.address.toLowerCase() !== admin.toLowerCase()));
      toast({ title: 'Admin Removed', description: `${admin} removed as admin.` });
    };

    contract.on('PointsClaimSubmitted', handlePointsClaimSubmitted);
    contract.on('PointsClaimApproved', handlePointsClaimApproved);
    contract.on('PointsClaimRejected', handlePointsClaimRejected);
    contract.on('TokensClaimed', handleTokensClaimed);
    contract.on('TokensDeposited', handleTokensDeposited);
    contract.on('AdminAdded', handleAdminAdded);
    contract.on('AdminRemoved', handleAdminRemoved);

    return () => {
      contract.removeAllListeners('PointsClaimSubmitted');
      contract.removeAllListeners('PointsClaimApproved');
      contract.removeAllListeners('PointsClaimRejected');
      contract.removeAllListeners('TokensClaimed');
      contract.removeAllListeners('TokensDeposited');
      contract.removeAllListeners('AdminAdded');
      contract.removeAllListeners('AdminRemoved');
    };
  }, [contract, provider, toast, fetchInitialData]);

  const handleApprove = async (player: string) => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    setLoadingClaim(player);
    setLoadingModalText('Approving claim...');
    setIsLoadingModalOpen(true);
    try {
      const result = await approvePointsClaimAA(aaSigner, player, 0, selectedToken, { gasMultiplier: clampedGasMultiplier });
      toast({
        title: 'Claim Approved',
        description: (
          <span>
            Approved {result.approvedPoints} points for {player}.{' '}
            <a
              href={`https://testnet.neroscan.io/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on Neroscan
            </a>
          </span>
        ),
        className: 'bg-green-400 text-black border-green-400',
      });
    } catch (err: any) {
      toast({ title: 'Approval Failed', description: err.message || 'Error approving claim.', variant: 'destructive' });
    } finally {
      setLoadingClaim(null);
      setIsLoadingModalOpen(false);
    }
  };

  const handleReject = async (player: string) => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    setLoadingClaim(player);
    setLoadingModalText('Rejecting claim...');
    setIsLoadingModalOpen(true);
    try {
      await rejectPointsClaimAA(aaSigner, player, 0, selectedToken, { gasMultiplier: clampedGasMultiplier });
      toast({
        title: 'Claim Rejected',
        description: `Claim for ${player} rejected.`,
        className: 'bg-red-400 text-black border-red-400',
      });
    } catch (err: any) {
      toast({ title: 'Rejection Failed', description: err.message || 'Error rejecting claim.', variant: 'destructive' });
    } finally {
      setLoadingClaim(null);
      setIsLoadingModalOpen(false);
    }
  };

  const handleApproveAll = async () => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    setLoadingModalText('Approving all claims...');
    setIsLoadingModalOpen(true);
    try {
      for (const claim of pendingClaims) {
        await handleApprove(claim.player);
      }
      toast({ title: 'All Claims Approved', description: 'All pending claims have been approved.' });
    } catch (err: any) {
      toast({ title: 'Batch Approval Failed', description: err.message || 'Error approving claims.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const handleRejectAll = async () => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    setLoadingModalText('Rejecting all claims...');
    setIsLoadingModalOpen(true);
    try {
      for (const claim of pendingClaims) {
        await handleReject(claim.player);
      }
      toast({ title: 'All Claims Rejected', description: 'All pending claims have been rejected.' });
    } catch (err: any) {
      toast({ title: 'Batch Rejection Failed', description: err.message || 'Error rejecting claims.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    if (!ethers.isAddress(newAdminAddress)) {
      toast({ title: 'Invalid Address', description: 'Please enter a valid Ethereum address.', variant: 'destructive' });
      return;
    }
    setLoadingModalText('Adding admin...');
    setIsLoadingModalOpen(true);
    try {
      await addAdminAA(aaSigner, newAdminAddress);
      setNewAdminAddress('');
      toast({ title: 'Admin Added', description: `${newAdminAddress} added as admin.` });
    } catch (err: any) {
      toast({ title: 'Add Admin Failed', description: err.message || 'Error adding admin.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const handleRemoveAdmin = async (adminAddress: string) => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    setLoadingModalText('Removing admin...');
    setIsLoadingModalOpen(true);
    try {
      await removeAdminAA(aaSigner, adminAddress);
      toast({ title: 'Admin Removed', description: `${adminAddress} removed as admin.` });
    } catch (err: any) {
      toast({ title: 'Remove Admin Failed', description: err.message || 'Error removing admin.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const handleSetPointsToTokensRate = async () => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    const rate = parseInt(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast({ title: 'Invalid Rate', description: 'Please enter a valid rate greater than 0.', variant: 'destructive' });
      return;
    }
    setLoadingModalText('Updating points to tokens rate...');
    setIsLoadingModalOpen(true);
    try {
      await setPointsToTokensRateAA(aaSigner, rate);
      setPointsToTokensRate(rate);
      toast({ title: 'Rate Updated', description: `Points to tokens rate set to ${rate}.` });
    } catch (err: any) {
      toast({ title: 'Rate Update Failed', description: err.message || 'Error updating rate.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-400 text-black';
      case 'rejected':
        return 'bg-red-400 text-black';
      default:
        return 'bg-yellow-400 text-black';
    }
  };

  // Dummy games for UI
  const games = [
    { id: 1, name: 'Honey Clicker', status: 'approved', players: 156 },
    { id: 2, name: 'Space Invaders', status: 'approved', players: 89 },
    { id: 3, name: 'Retro Puzzle', status: 'pending', players: 0 },
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <LoadingModal isOpen={isLoadingModalOpen} title="PROCESSING" description={loadingModalText} />
      {/* Header */}
      <div className="bg-black border-b-2 border-red-400 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl font-bold text-red-400 neon-text"> ADMIN_PANEL </h1>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black font-mono"
          >
            <LogOut className="w-4 h-4 mr-2" />
            LOGOUT
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <Button
            onClick={() => setActiveTab('claims')}
            className={`font-mono ${activeTab === 'claims' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
          >
            <Coins className="w-4 h-4 mr-2" />
            TOKEN_CLAIMS
          </Button>
          <Button
            onClick={() => setActiveTab('games')}
            className={`font-mono ${activeTab === 'games' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            GAMES
          </Button>
          <Button
            onClick={() => setActiveTab('admins')}
            className={`font-mono ${activeTab === 'admins' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
          >
            <Users className="w-4 h-4 mr-2" />
            ADMINS
          </Button>
          <Button
            onClick={() => setActiveTab('balance')}
            className={`font-mono ${activeTab === 'balance' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            BALANCE
          </Button>
        </div>

        {/* Token Claims Tab */}
        {activeTab === 'claims' && (
          <div>
            {/* Gas Multiplier Slider */}
            <div className="mb-6">
              <label className="text-cyan-400 text-sm font-bold mb-2 block">GAS_MULTIPLIER: {gasMultiplier[0]}x</label>
              <Slider
                value={gasMultiplier}
                onValueChange={setGasMultiplier}
                min={0.5}
                max={5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-green-400">
                <span>0.5x (MIN)</span>
                <span>1.0x (NORMAL)</span>
                <span>5.0x (MAX)</span>
              </div>
            </div>
            {/* Token Selector */}
            <div className="mb-6">
              <label className="text-cyan-400 text-sm font-bold mb-2 block">SELECT GAS TOKEN</label>
              <TokenSelector selectedToken={selectedToken} onTokenSelect={setSelectedToken} />
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cyan-400">PENDING TOKEN CLAIMS ({pendingClaims.length})</h2>
              {pendingClaims.length > 0 && (
                <div className="space-x-4">
                  <Button
                    onClick={handleApproveAll}
                    className="bg-green-400 text-black hover:bg-green-300 font-mono"
                  >
                    APPROVE_ALL
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    className="bg-red-400 text-black hover:bg-red-300 font-mono"
                  >
                    REJECT_ALL
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {pendingClaims.map((claim, idx) => (
                <Card key={claim.player + idx} className="bg-black border-cyan-400 p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <div>
                        <p className="font-bold text-cyan-400">{claim.player}</p>
                        <p className="text-green-400 text-sm">{claim.points} points</p>
                        <p className="text-gray-400 text-xs">Block: {claim.blockNumber || 'Pending'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-yellow-400 text-black">PENDING</Badge>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(claim.player)}
                          disabled={loadingClaim === claim.player}
                          className="bg-green-400 text-black hover:bg-green-300 font-mono"
                        >
                          {loadingClaim === claim.player ? '...' : 'APPROVE'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(claim.player)}
                          disabled={loadingClaim === claim.player}
                          className="bg-red-400 text-black hover:bg-red-300 font-mono"
                        >
                          {loadingClaim === claim.player ? '...' : 'REJECT'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div>
            <h2 className="text-xl font-bold text-cyan-400 mb-6">GAME MANAGEMENT</h2>
            <div className="space-y-4">
              {games.map((game) => (
                <Card key={game.id} className="bg-black border-cyan-400 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-cyan-400">{game.name}</p>
                      <p className="text-green-400 text-sm">{game.players} active players</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(game.status)}>{game.status.toUpperCase()}</Badge>
                      {game.status === 'pending' && (
                        <Button size="sm" className="bg-green-400 text-black hover:bg-green-300 font-mono">
                          APPROVE
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cyan-400">ADMIN MANAGEMENT</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Enter admin address"
                  value={newAdminAddress}
                  onChange={(e) => setNewAdminAddress(e.target.value)}
                  className="bg-gray-800 text-green-400 border-cyan-400 p-2 font-mono"
                />
                <Button
                  onClick={handleAddAdmin}
                  className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  ADD_ADMIN
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {admins.map((admin) => (
                <Card key={admin.address} className="bg-black border-cyan-400 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-cyan-400">{admin.address}</p>
                      <p className="text-green-400 text-sm">{admin.role}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-400 text-black">ACTIVE</Badge>
                      <Button
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.address)}
                        className="bg-red-400 text-black hover:bg-red-300 font-mono"
                      >
                        REMOVE
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <div>
            <h2 className="text-xl font-bold text-cyan-400 mb-6">CONTRACT BALANCE</h2>
            <Card className="bg-black border-cyan-400 p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-cyan-400">Current Balance</p>
                  <p className="text-green-400 text-2xl">{contractBalance} ARC</p>
                </div>
                <div>
                  <p className="font-bold text-cyan-400">Points to Tokens Rate</p>
                  <p className="text-green-400">{pointsToTokensRate} tokens/point</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="number"
                      placeholder="New rate"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="bg-gray-800 text-green-400 border-cyan-400 p-2 font-mono w-24"
                    />
                    <Button
                      onClick={handleSetPointsToTokensRate}
                      className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono"
                    >
                      UPDATE
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            <h3 className="text-lg font-bold text-cyan-400 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <Card key={idx} className="bg-black border-cyan-400 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-cyan-400">
                        {activity.type === 'TokensClaimed' ? 'Tokens Claimed' : 'Tokens Deposited'}
                      </p>
                      <p className="text-green-400 text-sm">
                        {activity.player || activity.owner}: {activity.amount} ARC
                      </p>
                      <p className="text-gray-400 text-xs">Block: {activity.blockNumber || 'Pending'}</p>
                    </div>
                    <Badge
                      className={
                        activity.type === 'TokensClaimed' ? 'bg-red-400 text-black' : 'bg-green-400 text-black'
                      }
                    >
                      {activity.type === 'TokensClaimed' ? 'WITHDRAWAL' : 'DEPOSIT'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;