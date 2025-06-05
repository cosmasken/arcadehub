import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { 
  Shield, 
  User, 
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Static admin credentials (in production, this would be handled by backend)
    const validCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'admin@arcade.com', password: 'admin123' }
    ];

    const isValid = validCredentials.some(
      cred => 
        (cred.username === credentials.username || cred.username === credentials.username) &&
        cred.password === credentials.password
    );

    setTimeout(() => {
      if (isValid) {
        onLogin(credentials);
        toast({
          title: "Access Granted",
          description: "Welcome to the admin panel",
          className: "bg-green-400 text-black border-green-400",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid credentials",
          className: "bg-red-400 text-black border-red-400",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono scanlines flex items-center justify-center px-6">
      <Card className="bg-black border-2 border-red-400 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-400 neon-text mb-2">
            &gt; ADMIN_ACCESS &lt;
          </h1>
          <p className="text-green-400 text-sm">
            AUTHORIZED PERSONNEL ONLY
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-green-400 text-sm font-bold mb-2">
              USERNAME / EMAIL
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-green-400" />
              <Input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="bg-black border-green-400 text-green-400 pl-10 font-mono"
                placeholder="Enter username or email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-green-400 text-sm font-bold mb-2">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-green-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="bg-black border-green-400 text-green-400 pl-10 pr-10 font-mono"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-green-400 hover:text-cyan-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-400 text-black hover:bg-red-300 font-mono font-bold py-3"
          >
            {isLoading ? 'AUTHENTICATING...' : 'ADMIN_LOGIN'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Demo credentials: admin / admin123
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
