import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import {
    TESTNET_CONFIG,
    getGasParameters,
    API_OPTIMIZATION,
} from '../config';

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
import { ethers } from 'ethers';

// const ARCADE_HUB_ADDRESS = ;

interface TokenClaim {
    id: number;
    playerName: string;
    amount: number;
    honeySpent: number;
    timestamp: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'claims' | 'games' | 'admins'>('claims');
    const { toast } = useToast();

    const [pendingClaims, setPendingClaims] = useState<any[]>([]);

    useEffect(() => {
        const fetchPendingClaims = async () => {
            const provider = new ethers.JsonRpcProvider(TESTNET_CONFIG.chain.rpcUrl); 
            const contract = new ethers.Contract(TESTNET_CONFIG.contracts.arcadeHub, ArcadeHubABI, provider);

            // Get all PointsClaimSubmitted events
            const submitted = await contract.queryFilter(contract.filters.PointsClaimSubmitted());
            // Get all PointsClaimApproved and PointsClaimRejected events
            const approved = await contract.queryFilter(contract.filters.PointsClaimApproved());
            const rejected = await contract.queryFilter(contract.filters.PointsClaimRejected());

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
                    points: e.args.points.toNumber(),
                    blockNumber: e.blockNumber,
                }));

            setPendingClaims(pending);
        };

        fetchPendingClaims();
    }, []);

    //   const [tokenClaims, setTokenClaims] = useState<TokenClaim[]>([
    //     { id: 1, playerName: 'CyberGamer42', amount: 5, honeySpent: 50000, timestamp: '2024-01-15 14:30', status: 'pending' },
    //     { id: 2, playerName: 'HoneyMaster', amount: 3, honeySpent: 30000, timestamp: '2024-01-15 13:45', status: 'pending' },
    //     { id: 3, playerName: 'RetroKing', amount: 8, honeySpent: 80000, timestamp: '2024-01-15 12:20', status: 'approved' },
    //     { id: 4, playerName: 'PixelWarrior', amount: 2, honeySpent: 20000, timestamp: '2024-01-15 11:15', status: 'pending' },
    //   ]);

    //   const [games, setGames] = useState([
    //     { id: 1, name: 'Honey Clicker', status: 'approved', players: 156 },
    //     { id: 2, name: 'Space Invaders', status: 'approved', players: 89 },
    //     { id: 3, name: 'Retro Puzzle', status: 'pending', players: 0 },
    //   ]);

    //   const pendingClaims = tokenClaims.filter(claim => claim.status === 'pending');

    //   const handleApprove = (claimId: number) => {
    //     setTokenClaims(prev => prev.map(claim => 
    //       claim.id === claimId ? { ...claim, status: 'approved' as const } : claim
    //     ));
    //     toast({
    //       title: "Claim Approved",
    //       description: "Token claim has been approved",
    //       className: "bg-green-400 text-black border-green-400",
    //     });
    //   };

    //   const handleReject = (claimId: number) => {
    //     setTokenClaims(prev => prev.map(claim => 
    //       claim.id === claimId ? { ...claim, status: 'rejected' as const } : claim
    //     ));
    //     toast({
    //       title: "Claim Rejected",
    //       description: "Token claim has been rejected",
    //       className: "bg-red-400 text-black border-red-400",
    //     });
    //   };

    //   const handleApproveAll = () => {
    //     setTokenClaims(prev => prev.map(claim => 
    //       claim.status === 'pending' ? { ...claim, status: 'approved' as const } : claim
    //     ));
    //     toast({
    //       title: "All Claims Approved",
    //       description: `${pendingClaims.length} claims approved`,
    //       className: "bg-green-400 text-black border-green-400",
    //     });
    //   };

    //   const handleRejectAll = () => {
    //     setTokenClaims(prev => prev.map(claim => 
    //       claim.status === 'pending' ? { ...claim, status: 'rejected' as const } : claim
    //     ));
    //     toast({
    //       title: "All Claims Rejected",
    //       description: `${pendingClaims.length} claims rejected`,
    //       className: "bg-red-400 text-black border-red-400",
    //     });
    //   };

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

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono scanlines">
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
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-cyan-400">
                                PENDING TOKEN CLAIMS ({pendingClaims.length})
                            </h2>
                            {pendingClaims.length > 0 && (
                                <div className="space-x-4">
                                    <Button
                                        // onClick={handleApproveAll}
                                        className="bg-green-400 text-black hover:bg-green-300 font-mono"
                                    >
                                        APPROVE_ALL
                                    </Button>
                                    <Button
                                        // onClick={handleRejectAll}
                                        className="bg-red-400 text-black hover:bg-red-300 font-mono"
                                    >
                                        REJECT_ALL
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {tokenClaims.map((claim) => (
                                <Card key={claim.id} className="bg-black border-cyan-400 p-6">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            {getStatusIcon(claim.status)}
                                            <div>
                                                <p className="font-bold text-cyan-400">{claim.playerName}</p>
                                                <p className="text-green-400 text-sm">
                                                    {claim.amount} HIVE tokens • {claim.honeySpent.toLocaleString()} honey
                                                </p>
                                                <p className="text-gray-400 text-xs">{claim.timestamp}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge className={getStatusColor(claim.status)}>
                                                {claim.status.toUpperCase()}
                                            </Badge>
                                            {claim.status === 'pending' && (
                                                <div className="space-x-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(claim.id)}
                                                        className="bg-green-400 text-black hover:bg-green-300 font-mono"
                                                    >
                                                        APPROVE
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleReject(claim.id)}
                                                        className="bg-red-400 text-black hover:bg-red-300 font-mono"
                                                    >
                                                        REJECT
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