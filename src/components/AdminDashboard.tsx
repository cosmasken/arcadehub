/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import PointsSystem from '../abi/PointsSystem.json';
import TokenSelector from './TokenSelector';
import { ethers } from 'ethers';
import { approvePointsClaimAA, rejectPointsClaimAA, getProvider, setPointsToTokensRateAA, addAdminAA, removeAdminAA } from '../lib/aaUtils';
import { useWalletStore } from '../stores/useWalletStore';

interface AdminUser {
  username: string;
  password: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
  adminUser: AdminUser | null;
}

interface Claim {
  player: string;
  claimIndex: number;
  points: number;
  blockNumber: number;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, adminUser }) => {
  const [activeTab, setActiveTab] = useState<'claims' | 'games' | 'admins' | 'balance'>('claims');
  const [activeClaimsTab, setActiveClaimsTab] = useState<'pending' | 'approved' | 'rejected' | 'history'>('pending');
  const { toast } = useToast();
  const [allClaims, setAllClaims] = useState<Claim[]>([]);
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const gasMultiplierPercent = Math.round(gasMultiplier[0] * 100);
  const clampedGasMultiplier = Math.max(50, Math.min(500, gasMultiplierPercent));

  const provider = getProvider();
  const contract = new ethers.Contract(TESTNET_CONFIG.smartContracts.pointsSystem, PointsSystem, provider);

  // Derive filtered claims
  const pendingClaims = useMemo(() => allClaims.filter(claim => claim.status === 'pending'), [allClaims]);
  const approvedClaims = useMemo(() => allClaims.filter(claim => claim.status === 'approved'), [allClaims]);
  const rejectedClaims = useMemo(() => allClaims.filter(claim => claim.status === 'rejected'), [allClaims]);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      // Fetch all claims
      const submittedEvents = (await contract.queryFilter(contract.filters.PointsClaimSubmitted()))
        .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
      const claims: Claim[] = [];
      const processedClaims = new Set<string>(); // player:claimIndex

      const uniquePlayers = new Set(submittedEvents.map(e => e.args.player));
      for (const player of uniquePlayers) {
        const claimCount = Number(await contract.getClaimsCount(player));
        for (let i = 0; i < claimCount; i++) {
          const [points, approved, rejected] = await contract.getClaim(player, i);
          if (processedClaims.has(`${player.toLowerCase()}:${i}`)) continue;
          const event = submittedEvents.find(
            e => e.args.player.toLowerCase() === player.toLowerCase() && Number(e.args.claimIndex) === i
          );
          let status: 'pending' | 'approved' | 'rejected' = 'pending';
          if (approved) status = 'approved';
          else if (rejected) status = 'rejected';
          claims.push({
            player,
            claimIndex: i,
            points: Number(points),
            blockNumber: event?.blockNumber || 0,
            status,
          });
          processedClaims.add(`${player.toLowerCase()}:${i}`);
        }
      }

      setAllClaims(claims.sort((a, b) => b.blockNumber - a.blockNumber));

      // Fetch contract balance
      const balance = await contract.getContractTokenBalance();
      const tokenContract = new ethers.Contract(await contract.arcToken(), ['function decimals() view returns (uint8)'], provider);
      const decimals = await tokenContract.decimals();
      setContractBalance(ethers.formatUnits(balance, decimals));

      // Fetch admins
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

      // Fetch recent activities
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
    } finally {
      setIsRefreshing(false);
    }
  }, [contract, provider, toast]);

  // Setup polling and event listeners
  useEffect(() => {
    fetchInitialData();

    // Polling every 30 seconds
    const pollingInterval = setInterval(() => {
      fetchInitialData();
    }, 30000);

    // Real-time event listeners
    const handlePointsClaimSubmitted = (player: string, claimIndex: ethers.BigNumberish, points: ethers.BigNumberish) => {
      setAllClaims(prev => {
        if (prev.some(claim => claim.player.toLowerCase() === player.toLowerCase() && claim.claimIndex === Number(claimIndex))) {
          return prev;
        }
        return [...prev, {
          player,
          claimIndex: Number(claimIndex),
          points: Number(points),
          blockNumber: 0,
          status: 'pending',
        }].sort((a, b) => b.blockNumber - a.blockNumber);
      });
      toast({ title: 'New Claim', description: `${player} submitted ${points} points (Claim #${claimIndex}).` });
    };
    const handlePointsClaimApproved = (player: string, claimIndex: ethers.BigNumberish, points: ethers.BigNumberish) => {
      setAllClaims(prev => prev.map(claim =>
        claim.player.toLowerCase() === player.toLowerCase() && claim.claimIndex === Number(claimIndex)
          ? { ...claim, status: 'approved' }
          : claim
      ));
      toast({ title: 'Claim Approved', description: `${player}'s ${points} points (Claim #${claimIndex}) approved.` });
      fetchInitialData(); // Immediate refresh
    };
    const handlePointsClaimRejected = (player: string, claimIndex: ethers.BigNumberish) => {
      setAllClaims(prev => prev.map(claim =>
        claim.player.toLowerCase() === player.toLowerCase() && claim.claimIndex === Number(claimIndex)
          ? { ...claim, status: 'rejected' }
          : claim
      ));
      toast({ title: 'Claim Rejected', description: `${player}'s Claim #${claimIndex} rejected.` });
      fetchInitialData(); // Immediate refresh
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
            fetchInitialData(); // Immediate refresh
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
            fetchInitialData(); // Immediate refresh
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
      fetchInitialData(); // Immediate refresh
    };
    const handleAdminRemoved = (admin: string) => {
      setAdmins(prev => prev.filter(a => a.address.toLowerCase() !== admin.toLowerCase()));
      toast({ title: 'Admin Removed', description: `${admin} removed as admin.` });
      fetchInitialData(); // Immediate refresh
    };

    contract.on('PointsClaimSubmitted', handlePointsClaimSubmitted);
    contract.on('PointsClaimApproved', handlePointsClaimApproved);
    contract.on('PointsClaimRejected', handlePointsClaimRejected);
    contract.on('TokensClaimed', handleTokensClaimed);
    contract.on('TokensDeposited', handleTokensDeposited);
    contract.on('AdminAdded', handleAdminAdded);
    contract.on('AdminRemoved', handleAdminRemoved);

    return () => {
      clearInterval(pollingInterval);
      contract.removeAllListeners('PointsClaimSubmitted');
      contract.removeAllListeners('PointsClaimApproved');
      contract.removeAllListeners('PointsClaimRejected');
      contract.removeAllListeners('TokensClaimed');
      contract.removeAllListeners('TokensDeposited');
      contract.removeAllListeners('AdminAdded');
      contract.removeAllListeners('AdminRemoved');
    };
  }, [contract, provider, toast, fetchInitialData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await fetchInitialData();
      toast({ title: 'Refreshed', description: 'Data refreshed successfully.' });
    } catch (err) {
      console.error('Refresh error:', err);
      toast({ title: 'Refresh Failed', description: 'Failed to refresh data.', variant: 'destructive' });
    }
  };

  const handleApprove = async (player: string, claimIndex: number) => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    const claimKey = `${player}:${claimIndex}`;
    setLoadingClaim(claimKey);
    setLoadingModalText('Approving claim...');
    setIsLoadingModalOpen(true);
    try {
      console.log(`Approving claim for player: ${player}, claimIndex: ${claimIndex}`);
      const result = await approvePointsClaimAA(aaSigner, player, claimIndex, selectedToken ? 1 : 0, selectedToken, { gasMultiplier: clampedGasMultiplier });
      toast({
        title: 'Claim Approved',
        description: (
          <span>
            Approved {result.approvedPoints} points for {player} (Claim #{claimIndex}).{' '}
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
      const errorMessage = err.message.includes('revert')
        ? `Transaction reverted: ${err.message}`
        : err.message || 'Unknown error approving claim';
      console.error(`Approval error: ${errorMessage}`, err);
      toast({
        title: 'Approval Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingClaim(null);
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after approval
    }
  };

  const handleReject = async (player: string, claimIndex: number) => {
    if (!aaSigner) {
      toast({ title: 'No admin wallet', description: 'Connect your admin AA wallet.', variant: 'destructive' });
      return;
    }
    const claimKey = `${player}:${claimIndex}`;
    setLoadingClaim(claimKey);
    setLoadingModalText('Rejecting claim...');
    setIsLoadingModalOpen(true);
    try {
      await rejectPointsClaimAA(aaSigner, player, claimIndex, selectedToken ? 1 : 0, selectedToken, { gasMultiplier: clampedGasMultiplier });
      toast({
        title: 'Claim Rejected',
        description: `Claim #${claimIndex} for ${player} rejected.`,
        className: 'bg-red-400 text-black border-red-400',
      });
    } catch (err: any) {
      const errorMessage = err.message.includes('revert')
        ? `Transaction reverted: ${err.message}`
        : err.message || 'Unknown error rejecting claim';
      console.error(`Rejection error: ${errorMessage}`, err);
      toast({
        title: 'Rejection Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoadingClaim(null);
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after rejection
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
        await handleApprove(claim.player, claim.claimIndex);
      }
      toast({ title: 'All Claims Approved', description: 'All pending claims have been approved.' });
    } catch (err: any) {
      console.error('Batch approval error:', err);
      toast({ title: 'Batch Approval Failed', description: err.message || 'Error approving claims.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after batch approval
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
        await handleReject(claim.player, claim.claimIndex);
      }
      toast({ title: 'All Claims Rejected', description: 'All pending claims have been rejected.' });
    } catch (err: any) {
      console.error('Batch rejection error:', err);
      toast({ title: 'Batch Rejection Failed', description: err.message || 'Error rejecting claims.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after batch rejection
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
      console.error('Add admin error:', err);
      toast({ title: 'Add Admin Failed', description: err.message || 'Error adding admin.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after adding admin
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
      console.error('Remove admin error:', err);
      toast({ title: 'Remove Admin Failed', description: err.message || 'Error removing admin.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after removing admin
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
      console.error('Rate update error:', err);
      toast({ title: 'Rate Update Failed', description: err.message || 'Error updating rate.', variant: 'destructive' });
    } finally {
      setIsLoadingModalOpen(false);
      fetchInitialData(); // Refresh after rate update
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

            {/* Claims Sub-Tabs */}
            <div className="flex space-x-4 mb-6">
              <Button
                onClick={() => setActiveClaimsTab('pending')}
                className={`font-mono ${activeClaimsTab === 'pending' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
              >
                PENDING ({pendingClaims.length})
              </Button>
              <Button
                onClick={() => setActiveClaimsTab('approved')}
                className={`font-mono ${activeClaimsTab === 'approved' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
              >
                APPROVED ({approvedClaims.length})
              </Button>
              <Button
                onClick={() => setActiveClaimsTab('rejected')}
                className={`font-mono ${activeClaimsTab === 'rejected' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
              >
                REJECTED ({rejectedClaims.length})
              </Button>
              <Button
                onClick={() => setActiveClaimsTab('history')}
                className={`font-mono ${activeClaimsTab === 'history' ? 'bg-cyan-400 text-black' : 'bg-gray-800 text-green-400 hover:bg-gray-700'}`}
              >
                HISTORY ({allClaims.length})
              </Button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-cyan-400">
                {activeClaimsTab.toUpperCase()} CLAIMS ({activeClaimsTab === 'pending' ? pendingClaims.length : activeClaimsTab === 'approved' ? approvedClaims.length : activeClaimsTab === 'rejected' ? rejectedClaims.length : allClaims.length})
              </h2>
              <div className="space-x-4">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-blue-400 text-black hover:bg-blue-300 font-mono"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'REFRESHING...' : 'REFRESH'}
                </Button>
                {activeClaimsTab === 'pending' && pendingClaims.length > 0 && (
                  <>
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
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {(activeClaimsTab === 'pending' ? pendingClaims : activeClaimsTab === 'approved' ? approvedClaims : activeClaimsTab === 'rejected' ? rejectedClaims : allClaims).map((claim, idx) => (
                <Card key={`${claim.player}:${claim.claimIndex}`} className="bg-black border-cyan-400 p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(claim.status)}
                      <div>
                        <p className="font-bold text-cyan-400">{claim.player}</p>
                        <p className="text-green-400 text-sm">{claim.points} points (Claim #{claim.claimIndex})</p>
                        <p className="text-gray-400 text-xs">Block: {claim.blockNumber || 'Pending'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(claim.status)}>{claim.status.toUpperCase()}</Badge>
                      {claim.status === 'pending' && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(claim.player, claim.claimIndex)}
                            disabled={loadingClaim === `${claim.player}:${claim.claimIndex}`}
                            className="bg-green-400 text-black hover:bg-green-300 font-mono"
                          >
                            {loadingClaim === `${claim.player}:${claim.claimIndex}` ? '...' : 'APPROVE'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(claim.player, claim.claimIndex)}
                            disabled={loadingClaim === `${claim.player}:${claim.claimIndex}`}
                            className="bg-red-400 text-black hover:bg-red-300 font-mono"
                          >
                            {loadingClaim === `${claim.player}:${claim.claimIndex}` ? '...' : 'REJECT'}
                          </Button>
                        </div>
                      )}
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