import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Gamepad, User, Code, Trophy, Menu, X } from "lucide-react";
import { useState } from 'react';
import useAuthStore from "@/hooks/use-auth"; // Update import path

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { loggedIn, login, logout,aaWallet } = useAuthStore(); 

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuth = async () => {
    if (loggedIn) {
      await logout();
    } else {
      await login();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-arcade-dark-blue/95 backdrop-blur-sm shadow-md border-b border-arcade-purple/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-gradient">ArcadeHub</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/" icon={<Gamepad size={18} />} label="Games" />
          <NavLink to="/profile" icon={<User size={18} />} label="Profile" />
          <NavLink to="/developers" icon={<Code size={18} />} label="Developers" />
          <NavLink to="/rewards" icon={<Trophy size={18} />} label="Rewards" />
          <NavLink to="/achievement-minting" icon={<Trophy size={18} />} label="Mint Achievements" />

          <Button 
            onClick={handleAuth}
            className="ml-4 bg-arcade-yellow text-black hover:bg-arcade-yellow/80"
          >
            {loggedIn ? (
              <span className="flex items-center">
                {aaWallet ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {`${aaWallet.slice(0,6)}...${aaWallet.slice(-4)}`}
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-red-500">Click to connect...</span>
                  </>
                )}
              </span>
            ) : (
              "Connect"
            )}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden p-2 text-white hover:text-arcade-purple transition-colors"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-arcade-dark-blue/95 border-b border-arcade-purple/20">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
            <MobileNavLink to="/" icon={<Gamepad size={18} />} label="Games" onClick={toggleMenu} />
            <MobileNavLink to="/profile" icon={<User size={18} />} label="Profile" onClick={toggleMenu} />
            <MobileNavLink to="/developers" icon={<Code size={18} />} label="Developers" onClick={toggleMenu} />
            <MobileNavLink to="/rewards" icon={<Trophy size={18} />} label="Rewards" onClick={toggleMenu} />
            
            <Button 
              onClick={() => {
                handleAuth();
                toggleMenu();
              }}
              className="w-full bg-arcade-yellow text-black hover:bg-arcade-yellow/80"
            >
              {loggedIn ? "Disconnect" : "Connect"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavLink = ({ to, icon, label }: NavLinkProps) => (
  <Link
    to={to}
    className="px-3 py-2 text-sm flex items-center text-white/80 hover:text-white transition-colors rounded-md hover:bg-white/5"
  >
    <span className="mr-1.5">{icon}</span>
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, icon, label, onClick }: NavLinkProps) => (
  <Link
    to={to}
    className="px-3 py-3 flex items-center text-white/80 hover:text-white transition-colors"
    onClick={onClick}
  >
    <span className="mr-2.5">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Navbar;