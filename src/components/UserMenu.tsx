// src/components/UserMenu.tsx
import { useState } from 'react';
import useWalletStore from '../stores/useWalletStore';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { LogOut, User, Settings, Wallet, Copy, Check, Gamepad2, Gift, Trophy } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Link } from 'react-router-dom';
import useProfileStore from '../stores/useProfileStore';
import { UserRole, UserRoles } from '../types/supabase';

export function UserMenu() {
  const { isConnected, aaWalletAddress, connect, disconnect } = useWalletStore();
  const { role } = useProfileStore();
  const isDeveloper = role === 'developer';
  const isAdmin = role === 'admin';
  const isGamer = role === 'gamer';
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoggingOut(true);
      await disconnect();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const copyToClipboard = async () => {
    if (!aaWalletAddress) return;
    try {
      await navigator.clipboard.writeText(aaWalletAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderUserTypeOptions = () => {
    if (!role) return null;

    const options = [];
    
    if (isDeveloper) {
      options.push(
        <DropdownMenuItem asChild key="dev-dashboard">
          <Link to="/developer/dashboard" className="w-full text-left">
            <Settings className="mr-2 h-4 w-4" />
            Developer Dashboard
          </Link>
        </DropdownMenuItem>,
        <DropdownMenuItem asChild key="dev-games">
          <Link to="/developer/games" className="w-full text-left">
            <Gamepad2 className="mr-2 h-4 w-4" />
            My Games
          </Link>
        </DropdownMenuItem>
      );
    } else if (isAdmin) {
      options.push(
        <DropdownMenuItem asChild key="admin-dashboard">
          <Link to="/admin/dashboard" className="w-full text-left">
            <Settings className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Link>
        </DropdownMenuItem>,
        <DropdownMenuItem asChild key="admin-users">
          <Link to="/admin/users" className="w-full text-left">
            <User className="mr-2 h-4 w-4" />
            Manage Users
          </Link>
        </DropdownMenuItem>
      );
    } else if (isGamer) {
      options.push(
        <DropdownMenuItem asChild key="profile">
          <Link to="/profile" className="w-full text-left">
            <User className="mr-2 h-4 w-4" />
            My Profile
          </Link>
        </DropdownMenuItem>,
        <DropdownMenuItem asChild key="leaderboard">
          <Link to="/leaderboard" className="w-full text-left">
            <Trophy className="mr-2 h-4 w-4" />
            Leaderboard
          </Link>
        </DropdownMenuItem>
      );
    }

    return options;
  };

  if (!isConnected || !aaWalletAddress) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs tracking-wider border-2 border-cyan-400 hover:border-green-400 transition-all duration-200"
      >
        <Wallet className="w-4 h-4 mr-2" />
        CONNECT WALLET
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center space-x-2 bg-black border-2 border-green-400 px-4 py-2 rounded-full">
        <Wallet className="w-4 h-4 text-green-400" />
        <span className="text-xs font-mono tracking-wider text-green-400">CONNECTED</span>
        <span className="flex items-center ml-2">
          <span className="font-mono text-xs text-cyan-400">{truncateAddress(aaWalletAddress)}</span>
          <button
            onClick={copyToClipboard}
            className="ml-1 text-cyan-400 hover:text-green-400 transition-colors duration-200"
            title={copiedAddress ? "Copied!" : "Copy address"}
          >
            {copiedAddress ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{truncateAddress(aaWalletAddress)}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {role || 'User'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {role && (
            <>
              {renderUserTypeOptions()}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            <button onClick={copyToClipboard} className="w-full text-left">
              <Copy className="mr-2 h-4 w-4" />
              Copy Address
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button onClick={handleDisconnect} className="w-full text-left">
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Disconnect'}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}