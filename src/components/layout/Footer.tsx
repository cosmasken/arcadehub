
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-arcade-dark-blue/90 text-white/70 mt-12 border-t border-arcade-purple/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gradient">ArcadeHub</h3>
            <p className="text-sm">
              The premier decentralized gaming platform on the NERO Chain.
              Play, earn, and own your gaming assets.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/games" className="hover:text-arcade-pink transition-colors">Games</Link></li>
              <li><Link to="/profile" className="hover:text-arcade-pink transition-colors">Profile</Link></li>
              <li><Link to="/developers" className="hover:text-arcade-pink transition-colors">Developers</Link></li>
              <li><Link to="/rewards" className="hover:text-arcade-pink transition-colors">Rewards</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-arcade-pink transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-arcade-pink transition-colors">Support</Link></li>
              <li><Link to="/docs" className="hover:text-arcade-pink transition-colors">Documentation</Link></li>
              <li><Link to="/terms" className="hover:text-arcade-pink transition-colors">Terms & Privacy</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Community</h4>
            <div className="flex space-x-3 mb-4">
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-arcade-blue transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.834 19.834 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"></path></svg>
              </a>
              <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-arcade-blue transition-colors">
                <span className="sr-only">Telegram</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.494-1.302.48c-.428-.012-1.252-.241-1.865-.44c-.752-.244-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z"></path></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-arcade-blue transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path></svg>
              </a>
            </div>
            <p className="text-sm">Join our community to stay updated on the latest games and events!</p>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-4 text-center text-xs">
          <p>© 2025 ArcadeHub. All rights reserved.</p>
          <p className="mt-1">Powered by NERO Chain</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
