// src/components/UserMenu.tsx
import { useState } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
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
import { LogOut, User, Settings, Wallet, Copy, Check, ChevronDown } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { Link } from 'react-router-dom';
import useProfileStore from '../stores/useProfileStore';

export function UserMenu() {
  const { isConnected, aaWalletAddress, connectWallet, disconnectWallet } = useWalletStore();
  const { role } = useProfileStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
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
      await disconnectWallet();
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

  if (!isConnected || !aaWalletAddress) {
    return (
      <Button
        onClick={handleConnect}
        className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs tracking-wider border-2 border-cyan-400 hover:border-green-400"
      >
        <Wallet className="w-4 h-4 mr-2" />
         CONNECT_WALLET
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center space-x-2 bg-black border-2 border-green-400 px-4 py-2">
        <Wallet className="w-4 h-4 text-green-400" />
        <span className="text-xs font-mono tracking-wider text-green-400">CONNECTED</span>
        <span className="flex items-center ml-2">
          <span className="font-mono text-xs text-cyan-400">{truncateAddress(aaWalletAddress)}</span>
          <button
            onClick={copyToClipboard}
            className="ml-1 text-cyan-400 hover:text-green-400"
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
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-cyan-400 hover:text-green-400 border border-transparent hover:border-cyan-400 p-2"
          >
            <Avatar className="w-8 h-8 border-2 border-cyan-400">
              <AvatarFallback className="bg-black text-cyan-400">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-mono tracking-wider">
              {truncateAddress(aaWalletAddress)}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="bg-black border-2 border-cyan-400 text-green-400 font-mono"
          align="end"
        >
          {role === 'gamer' ? (
            <>
              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
                >
                  <User className="w-4 h-4" />
                  <span>&gt; MY PROFILE</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cyan-400" />
            </>
          ) : (
            <DropdownMenuItem asChild>
              <Link
                to={aaWalletAddress ? `/developer/profile/${aaWalletAddress}` : "/developer"}
                className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
              >
                <span>&gt; DEV DASHBOARD</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link
              to="/settings"
              className="flex items-center space-x-2 cursor-pointer hover:text-cyan-400"
            >
              <Settings className="w-4 h-4" />
              <span>&gt; SETTINGS</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-cyan-400" />
          <DropdownMenuItem
            onClick={handleDisconnect}
            disabled={isLoggingOut}
            className="flex items-center space-x-2 cursor-pointer hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'LOGGING OUT...' : '> LOGOUT'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}