import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import {
    TESTNET_CONFIG,
} from '../config';
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
    Settings
} from 'lucide-react';

import ArcadeHubABI from '../abi/ArcadeHub.json'
import TokenSelector from './TokenSelector';
import { ethers } from 'ethers';
import { approvePointsClaimAA, rejectPointsClaimAA } from '../lib/aaUtils';
import { useWalletStore } from '../stores/useWalletStore';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'claims' | 'games' | 'admins'>('claims');
    const { toast } = useToast();
    const [pendingClaims, setPendingClaims] = useState<any[]>([]);
    const [loadingClaim, setLoadingClaim] = useState<string | null>(null);
    const { aaSigner } = useWalletStore();
    const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
    const [loadingModalText, setLoadingModalText] = useState<string | undefined>(undefined);

    const [selectedToken, setSelectedToken] = useState<string>('');
    const [gasMultiplier, setGasMultiplier] = useState([1.5]); 

    // Clamp and convert to percent for AA utils
    const gasMultiplierPercent = Math.round(gasMultiplier[0] * 100);
    const clampedGasMultiplier = Math.max(50, Math.min(500, gasMultiplierPercent));


    // Fetch pending claims from contract events
    // ...existing code...
    useEffect(() => {
        const fetchPendingClaims = async () => {
            const provider = new ethers.JsonRpcProvider(TESTNET_CONFIG.chain.rpcUrl);
            const contract = new ethers.Contract(TESTNET_CONFIG.contracts.arcadeHub, ArcadeHubABI, provider);

            // Get all PointsClaimSubmitted events
            const submitted = (await contract.queryFilter(contract.filters.PointsClaimSubmitted()))
                .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
            // Get all PointsClaimApproved and PointsClaimRejected events
            const approved = (await contract.queryFilter(contract.filters.PointsClaimApproved()))
                .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);
            const rejected = (await contract.queryFilter(contract.filters.PointsClaimRejected()))
                .filter((e): e is ethers.EventLog => e instanceof Object && 'args' in e);

            // Build sets of processed claims
            const processed = new Set([
                ...approved.map(e => e.args.player.toLowerCase()),
                ...rejected.map(e => e.args.player.toLowerCase()),
            ]);

            // Filter out processed claims
            const pending = submitted
                .filter(e => !processed.has(e.args.player.toLowerCase()))
                .map(e => ({
                    player: e.args.player,
                    points: Number(e.args.points),
                    blockNumber: e.blockNumber,
                }));

            setPendingClaims(pending);
        };

        fetchPendingClaims();
    }, []);
    // ...existing code...
// ...existing code...

const handleApprove = async (player: string) => {
    if (!aaSigner) {
        toast({ title: "No admin wallet", description: "Connect your admin AA wallet.", variant: "destructive" });
        return;
    }
    setLoadingClaim(player);
    setLoadingModalText("Approving claim...");
    setIsLoadingModalOpen(true);
    try {
        await approvePointsClaimAA(aaSigner, player, 1, selectedToken, { gasMultiplier: clampedGasMultiplier });          
        toast({ title: "Claim Approved", description: `Claim for ${player} approved.`, className: "bg-green-400 text-black border-green-400" });
        setPendingClaims(prev => prev.filter(claim => claim.player !== player));
    } catch (err: any) {
        toast({ title: "Approval Failed", description: err.message || "Error approving claim.", variant: "destructive" });
    }
    setLoadingClaim(null);
    setIsLoadingModalOpen(false);
};

const handleReject = async (player: string) => {
    if (!aaSigner) {
        toast({ title: "No admin wallet", description: "Connect your admin AA wallet.", variant: "destructive" });
        return;
    }
    setLoadingClaim(player);
    setLoadingModalText("Rejecting claim...");
    setIsLoadingModalOpen(true);
    try {
        await rejectPointsClaimAA(aaSigner, player, 1, selectedToken, { gasMultiplier: clampedGasMultiplier }); // <-- add gasMultiplier
        toast({ title: "Claim Rejected", description: `Claim for ${player} rejected.`, className: "bg-red-400 text-black border-red-400" });
        setPendingClaims(prev => prev.filter(claim => claim.player !== player));
    } catch (err: any) {
        toast({ title: "Rejection Failed", description: err.message || "Error rejecting claim.", variant: "destructive" });
    }
    setLoadingClaim(null);
    setIsLoadingModalOpen(false);
};



    // Approve all pending claims
   const handleApproveAll = async () => {
        setLoadingModalText("Approving all claims...");
        setIsLoadingModalOpen(true);
        for (const claim of pendingClaims) {
            await handleApprove(claim.player);
        }
        setIsLoadingModalOpen(false);
    };

    // Reject all pending claims
      const handleRejectAll = async () => {
        setLoadingModalText("Rejecting all claims...");
        setIsLoadingModalOpen(true);
        for (const claim of pendingClaims) {
            await handleReject(claim.player);
        }
        setIsLoadingModalOpen(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-400 text-black';
            case 'rejected': return 'bg-red-400 text-black';
            default: return 'bg-yellow-400 text-black';
        }
    };

    // Dummy games/admins for UI completeness
    const games = [
        { id: 1, name: 'Honey Clicker', status: 'approved', players: 156 },
        { id: 2, name: 'Space Invaders', status: 'approved', players: 89 },
        { id: 3, name: 'Retro Puzzle', status: 'pending', players: 0 },
    ];

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono">
            <LoadingModal
                isOpen={isLoadingModalOpen}
                title="PROCESSING"
                description={loadingModalText}
            />
            {/* Header */}
            <div className="bg-black border-b-2 border-red-400 p-6">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Shield className="w-8 h-8 text-red-400" />
                        <h1 className="text-2xl font-bold text-red-400 neon-text">
                            &gt; ADMIN_PANEL &lt;
                        </h1>
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
                </div>

                {/* Token Claims Tab */}
                {activeTab === 'claims' && (
                    <div>
                        {/* Gas Multiplier Slider */}
                    <div className="mb-6">
                        <label className="text-cyan-400 text-sm font-bold mb-2 block">
                            GAS_MULTIPLIER: {gasMultiplier[0]}x
                        </label>
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
                            <label className="text-cyan-400 text-sm font-bold mb-2 block">
                                SELECT GAS TOKEN
                            </label>
                            <TokenSelector
                                selectedToken={selectedToken}
                                onTokenSelect={setSelectedToken}
                            />
                        </div>

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-cyan-400">
                                PENDING TOKEN CLAIMS ({pendingClaims.length})
                            </h2>
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
                                                <p className="text-green-400 text-sm">
                                                    {claim.points} points
                                                </p>
                                                <p className="text-gray-400 text-xs">Block: {claim.blockNumber}</p>
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
                                                    {loadingClaim === claim.player ? "..." : "APPROVE"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReject(claim.player)}
                                                    disabled={loadingClaim === claim.player}
                                                    className="bg-red-400 text-black hover:bg-red-300 font-mono"
                                                >
                                                    {loadingClaim === claim.player ? "..." : "REJECT"}
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
                                            <Badge className={game.status === 'approved' ? 'bg-green-400 text-black' : 'bg-yellow-400 text-black'}>
                                                {game.status.toUpperCase()}
                                            </Badge>
                                            {game.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-green-400 text-black hover:bg-green-300 font-mono"
                                                >
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
                            <Button className="bg-cyan-400 text-black hover:bg-cyan-300 font-mono">
                                <UserPlus className="w-4 h-4 mr-2" />
                                ADD_ADMIN
                            </Button>
                        </div>
                        <Card className="bg-black border-cyan-400 p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-cyan-400">admin@arcade.com</p>
                                    <p className="text-green-400 text-sm">Super Administrator</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Badge className="bg-green-400 text-black">ACTIVE</Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-gray-600 text-gray-400 hover:bg-gray-800 font-mono"
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        EDIT
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;