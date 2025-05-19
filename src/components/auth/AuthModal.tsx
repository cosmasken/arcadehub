import React, { useState } from 'react';
import { X, Mail, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (method: string, data?: { email?: string; password?: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [activeView, setActiveView] = useState<'methods' | 'email'>('methods');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    onLogin('email', { email, password });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-card w-full max-w-md relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>

          {activeView === 'methods' ? (
            <div className="space-y-4">
              <Button
                variant="outline"               
                size="lg"
                onClick={() => onLogin('google')}
                className="justify-center"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Continue with Google
              </Button>

              <Button
                variant="outline"               
                size="lg"
                onClick={() => onLogin('discord')}
                className="justify-center"
              >
                <img
                  src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
                  alt="Discord"
                  className="w-5 h-5 mr-2"
                />
                Continue with Discord
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveView('email')}
                className="justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Continue with Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 text-error-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" variant="default"  size="lg">
                Sign In
              </Button>

              <button
                type="button"
                onClick={() => setActiveView('methods')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to all options
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;