
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import LoadingModal from '../components/LoadingModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Wallet, 
  Shield, 
  Github, 
  Globe,
  Zap,
  Trophy,
  ArrowRight
} from 'lucide-react';

const SponsorLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const loginMethods = [
    {
      id: 'web3',
      name: "Web3 Wallet",
      description: "Connect with MetaMask, WalletConnect, etc.",
      icon: Wallet,
      recommended: true,
      available: true
    },
    {
      id: 'corporate',
      name: "Corporate Account",
      description: "Enterprise-grade authentication",
      icon: Shield,
      comingSoon: true,
      available: false
    },
    {
      id: 'github',
      name: "GitHub",
      description: "For developer-focused sponsors",
      icon: Github,
      available: false
    },
    {
      id: 'social',
      name: "Google/Social",
      description: "Quick social media login",
      icon: Globe,
      available: false
    }
  ];

  // const handleLogin = async (methodId: string) => {
  //   if (methodId !== 'web3') {
  //     toast({
  //       title: "Coming Soon",
  //       description: "This login method will be available soon!",
  //       className: "bg-yellow-400 text-black border-yellow-400",
  //     });
  //     return;
  //   }

  //   setSelectedMethod(methodId);
  //   setIsLoading(true);

  //   try {
  //     await login();
      
  //     toast({
  //       title: "Welcome, Sponsor!",
  //       description: "Successfully connected. Redirecting to sponsor dashboard...",
  //       className: "bg-green-400 text-black border-green-400",
  //     });

  //     setTimeout(() => {
  //       navigate('/sponsor/dashboard');
  //     }, 1500);

  //   } catch (error) {
  //     toast({
  //       title: "Login Failed",
  //       description: "Failed to connect wallet. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //     setSelectedMethod(null);
  //   }
  // };

  // Redirect if already logged in
  // React.useEffect(() => {
  //   if (user) {
  //     navigate('/sponsor/dashboard');
  //   }
  // }, [user, navigate]);

  return (
    <div className="min-h-screen bg-black text-green-400">
      <Header />
      
      <main className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl md:text-5xl font-mono font-bold text-cyan-400 neon-text">
                &gt; SPONSOR_LOGIN &lt;
              </h1>
            </div>
            <p className="text-xl text-green-400 max-w-2xl mx-auto mb-8">
              Access your sponsor dashboard to create tournaments, manage prize pools, 
              and engage with the gaming community.
            </p>
          </div>

          {/* Login Methods */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {loginMethods.map((method) => (
              <Card key={method.id} className="bg-black border-2 border-green-400 text-green-400 relative">
                {method.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-400 text-black font-mono text-xs px-2 py-1 rounded">
                      RECOMMENDED
                    </div>
                  </div>
                )}
                {method.comingSoon && (
                  <div className="absolute -top-3 right-4">
                    <div className="bg-cyan-400 text-black font-mono text-xs px-2 py-1 rounded">
                      COMING_SOON
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <method.icon className="w-8 h-8 text-cyan-400" />
                    <div>
                      <CardTitle className="text-cyan-400 font-mono">{method.name}</CardTitle>
                      <CardDescription className="text-green-400/80">
                        {method.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-yellow-400 text-black hover:bg-green-400 font-mono"
                    disabled={!method.available || isLoading}
                    // onClick={() => handleLogin(method.id)}
                    onClick={() => navigate('/sponsor/dashboard')}// Temporary navigation for demo
                  >
                    {isLoading && selectedMethod === method.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>CONNECTING...</span>
                      </div>
                    ) : method.available ? (
                      <>
                        <span>CONNECT</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      'COMING_SOON'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-16 border-2 border-yellow-400 p-8 rounded bg-yellow-400/10">
            <h2 className="text-2xl font-mono text-yellow-400 mb-6 text-center">
              &gt; SPONSOR_BENEFITS &lt;
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-cyan-400 font-mono font-bold mb-2">INSTANT_SETUP</h3>
                <p className="text-green-400 text-sm">
                  Create tournaments and deposit prize pools in minutes
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-cyan-400 font-mono font-bold mb-2">TRANSPARENT_DISTRIBUTION</h3>
                <p className="text-green-400 text-sm">
                  All prize distributions are handled automatically on-chain
                </p>
              </div>
              <div className="text-center">
                <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-cyan-400 font-mono font-bold mb-2">ENGAGED_AUDIENCE</h3>
                <p className="text-green-400 text-sm">
                  Reach competitive gamers and crypto enthusiasts
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LoadingModal
        isOpen={isLoading}
        title="CONNECTING WALLET"
        description="Please confirm the connection in your wallet..."
      />
    </div>
  );
};

export default SponsorLogin;
