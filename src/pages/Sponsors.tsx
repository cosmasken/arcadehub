import Layout from "../components/Layout";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Trophy, 
  Shield, 
  Coins, 
  Users, 
  Target, 
  Zap,
  ChevronRight,
  Star,
  Lock,
  Wallet,
  Globe,
  Github,
  ArrowRight
} from 'lucide-react';
import {Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
const Sponsors = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const sponsorshipTiers = [
    {
      name: "BRONZE_TIER",
      price: "100 TOKENS",
      features: [
        "Logo in tournament listing",
        "Basic sponsor recognition",
        "Tournament analytics"
      ],
      color: "bg-orange-400"
    },
    {
      name: "SILVER_TIER", 
      price: "500 TOKENS",
      features: [
        "Premium logo placement",
        "Custom sponsor message",
        "Winner announcement rights",
        "Extended analytics"
      ],
      color: "bg-gray-400"
    },
    {
      name: "GOLD_TIER",
      price: "1000 TOKENS",
      features: [
        "Featured tournament status",
        "Custom tournament branding",
        "Live stream integration",
        "Direct player engagement",
        "Full analytics suite"
      ],
      color: "bg-yellow-400"
    }
  ];

  const loginOptions = [
    {
      name: "Web3 Wallet",
      description: "Connect with MetaMask, WalletConnect, etc.",
      icon: Wallet,
      recommended: true
    },
    {
      name: "Corporate Account",
      description: "Enterprise-grade authentication",
      icon: Shield,
      comingSoon: true
    },
    {
      name: "GitHub",
      description: "For developer-focused sponsors",
      icon: Github
    },
    {
      name: "Google/Social",
      description: "Quick social media login",
      icon: Globe
    }
  ];

  return (
    <Layout>
      
    <div className="min-h-screen bg-black text-green-400">
      
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl md:text-5xl font-mono font-bold text-cyan-400 neon-text">
                 SPONSOR_TOURNAMENTS 
              </h1>
            </div>
            <p className="text-xl text-green-400 max-w-3xl mx-auto mb-8">
              Fund competitive gaming tournaments with transparent, on-chain prize distribution.
              Your brand reaches passionate gamers while supporting the competitive scene.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-yellow-400 text-black hover:bg-green-400 font-mono"
                asChild
              >
                <Link to="/sponsor/login">
                  <Zap className="w-4 h-4 mr-2" />
                  START SPONSORING
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              {/* <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                VIEW DEMO
              </Button> */}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center mb-12 border-b-2 border-green-400">
            {[
              { id: 'overview', label: 'OVERVIEW' },
              { id: 'how-it-works', label: 'HOW_IT_WORKS' },
              { id: 'pricing', label: 'PRICING' },
              { id: 'login', label: 'LOGIN_OPTIONS' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-mono text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-green-400 hover:text-cyan-400'
                }`}
              >
                 {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              {/* Key Benefits */}
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-black border-2 border-green-400 text-green-400">
                  <CardHeader>
                    <Shield className="w-12 h-12 text-cyan-400 mb-4" />
                    <CardTitle className="text-cyan-400 font-mono">TRANSPARENT_DISTRIBUTION</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>All prize distributions are handled automatically via smart contracts. No manual intervention, complete transparency.</p>
                  </CardContent>
                </Card>

                <Card className="bg-black border-2 border-green-400 text-green-400">
                  <CardHeader>
                    <Target className="w-12 h-12 text-cyan-400 mb-4" />
                    <CardTitle className="text-cyan-400 font-mono">ONCHAIN_SCORING</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Game scores and rankings are recorded on-chain, ensuring fair competition and tamper-proof results.</p>
                  </CardContent>
                </Card>

                <Card className="bg-black border-2 border-green-400 text-green-400">
                  <CardHeader>
                    <Users className="w-12 h-12 text-cyan-400 mb-4" />
                    <CardTitle className="text-cyan-400 font-mono">ENGAGED_AUDIENCE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Reach competitive gamers and crypto enthusiasts in an authentic gaming environment.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="border border-yellow-400 p-6 rounded bg-yellow-400/10">
                  <div className="text-3xl font-bold text-yellow-400 font-mono">2.5K+</div>
                  <div className="text-green-400 text-sm">ACTIVE_PLAYERS</div>
                </div>
                <div className="border border-cyan-400 p-6 rounded bg-cyan-400/10">
                  <div className="text-3xl font-bold text-cyan-400 font-mono">150+</div>
                  <div className="text-green-400 text-sm">TOURNAMENTS</div>
                </div>
                <div className="border border-green-400 p-6 rounded bg-green-400/10">
                  <div className="text-3xl font-bold text-green-400 font-mono">50K+</div>
                  <div className="text-green-400 text-sm">TOKENS_DISTRIBUTED</div>
                </div>
                <div className="border border-yellow-400 p-6 rounded bg-yellow-400/10">
                  <div className="text-3xl font-bold text-yellow-400 font-mono">99.9%</div>
                  <div className="text-green-400 text-sm">UPTIME</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'how-it-works' && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-mono text-cyan-400 mb-4"> SPONSORSHIP_PROCESS </h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-mono font-bold">1</div>
                      <div>
                        <h3 className="text-green-400 font-bold">Login as Sponsor</h3>
                        <p className="text-green-400/80">Connect your Web3 wallet or corporate account</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-mono font-bold">2</div>
                      <div>
                        <h3 className="text-green-400 font-bold">Create Tournament</h3>
                        <p className="text-green-400/80">Set up tournament details, rules, and branding</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-mono font-bold">3</div>
                      <div>
                        <h3 className="text-green-400 font-bold">Fund Prize Pool</h3>
                        <p className="text-green-400/80">Deposit tokens to the tournament's prize pool smart contract</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-mono font-bold">4</div>
                      <div>
                        <h3 className="text-green-400 font-bold">Automatic Distribution</h3>
                        <p className="text-green-400/80">Winners receive prizes automatically based on on-chain rankings</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-cyan-400 p-6 rounded bg-cyan-400/10">
                  <h3 className="text-cyan-400 font-mono font-bold mb-4">ONCHAIN_GUARANTEE</h3>
                  <ul className="space-y-2 text-green-400">
                    <li className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-yellow-400" />
                      <span>Funds locked in smart contract</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-yellow-400" />
                      <span>Tamper-proof score recording</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Instant prize distribution</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-mono text-cyan-400 mb-4"> SPONSORSHIP_TIERS </h2>
                <p className="text-green-400">Choose the level of visibility and engagement that fits your brand</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {sponsorshipTiers.map((tier, index) => (
                  <Card key={index} className="bg-black border-2 border-green-400 text-green-400 relative">
                    {index === 2 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-400 text-black font-mono">POPULAR</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center mb-4`}>
                        <Star className="w-6 h-6 text-black" />
                      </div>
                      <CardTitle className="text-cyan-400 font-mono">{tier.name}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold text-yellow-400 font-mono">{tier.price}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <ChevronRight className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-6 bg-yellow-400 text-black hover:bg-green-400 font-mono"
                        asChild
                      >
                        <Link to="/sponsor/login">
                          SELECT TIER
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'login' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-mono text-cyan-400 mb-4"> SPONSOR_LOGIN_OPTIONS </h2>
                <p className="text-green-400">Multiple authentication methods for different sponsor types</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {loginOptions.map((option, index) => (
                  <Card key={index} className="bg-black border-2 border-green-400 text-green-400 relative">
                    {option.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-400 text-black font-mono">RECOMMENDED</Badge>
                      </div>
                    )}
                    {option.comingSoon && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-cyan-400 text-black font-mono">COMING_SOON</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <option.icon className="w-8 h-8 text-cyan-400" />
                        <div>
                          <CardTitle className="text-cyan-400 font-mono">{option.name}</CardTitle>
                          <CardDescription className="text-green-400/80">
                            {option.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full bg-yellow-400 text-black hover:bg-green-400 font-mono"
                        disabled={option.comingSoon}
                        asChild={!option.comingSoon}
                      >
                        {option.comingSoon ? (
                          <span>COMING_SOON</span>
                        ) : (
                          <Link to="/sponsor/login">
                            CONNECT
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <div className="border border-yellow-400 p-6 rounded bg-yellow-400/10 max-w-2xl mx-auto">
                  <h3 className="text-yellow-400 font-mono font-bold mb-2">SECURITY_FIRST</h3>
                  <p className="text-green-400 text-sm">
                    All sponsor accounts use enterprise-grade security with multi-factor authentication 
                    and audit trails for all sponsorship activities.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="text-center mt-16 border-2 border-yellow-400 p-8 rounded bg-yellow-400/10">
            <h2 className="text-2xl font-mono text-yellow-400 mb-4"> READY_TO_SPONSOR? </h2>
            <p className="text-green-400 mb-6">
              Join the future of competitive gaming sponsorship with transparent, 
              on-chain prize distribution.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                className="bg-yellow-400 text-black hover:bg-green-400 font-mono"
                asChild
              >
                <Link to="/sponsor/login">
                  <Coins className="w-4 h-4 mr-2" />
                  CREATE_SPONSOR_ACCOUNT
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              {/* <Button 
                variant="outline" 
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono"
                asChild
              >
                <Link to="/tournaments">
                  VIEW_TOURNAMENTS
                </Link>
              </Button> */}
            </div>
          </div>
        </div>
      </main>
    </div>

    </Layout>
  );
};

export default Sponsors;