import Layout from "../components/Layout";

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft,
  Users, 
  Trophy,
  Star,
  Calendar,
  ExternalLink,
  Heart
} from 'lucide-react';

const CollectionDetail = () => {
  const { id } = useParams();
  
  // Mock collection data - in real app this would come from API
  const collection = {
    id: 1,
    name: "CYBER_WARRIORS",
    description: "Elite gaming NFT collection featuring cyberpunk warriors with unique abilities and rare traits. Each warrior comes with special powers and can be used across multiple games in our ecosystem.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
    items: 10000,
    floor: "0.5",
    volume: "1,247",
    owners: 3456,
    created: "2024-01-15",
    creator: "CYBER_STUDIO",
    website: "https://cyberwarriors.io",
    twitter: "@cyberwarriors"
  };

  const nftItems = [
    {
      id: 1,
      name: "CYBER_WARRIOR_#001",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
      price: "0.8 NERO",
      rarity: "LEGENDARY"
    },
    {
      id: 2,
      name: "CYBER_WARRIOR_#156",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
      price: "0.6 NERO",
      rarity: "RARE"
    },
    {
      id: 3,
      name: "CYBER_WARRIOR_#789",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
      price: "0.4 NERO",
      rarity: "COMMON"
    },
    {
      id: 4,
      name: "CYBER_WARRIOR_#2341",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=300&fit=crop",
      price: "0.7 NERO",
      rarity: "EPIC"
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'bg-yellow-500';
      case 'EPIC':
        return 'bg-purple-500';
      case 'RARE':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <Layout>
      
      <div className="min-h-screen bg-black text-green-400 font-mono">
        
        
        <div className="pt-24 pb-16 px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Back Button */}
            <Link to="/collections" className="inline-flex items-center text-cyan-400 hover:text-green-400 mb-8 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
               BACK_TO_COLLECTIONS
            </Link>

            {/* Collection Header */}
            <div className="relative mb-12">
              <img
                src={collection.coverImage}
                alt={collection.name}
                className="w-full h-64 object-cover rounded-lg border-2 border-cyan-400"
              />
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-end">
                <div className="p-8 flex items-end space-x-6">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-32 h-32 rounded-lg border-2 border-cyan-400"
                  />
                  <div>
                    <h1 className="text-4xl font-bold text-cyan-400 mb-2 neon-text">
                      {collection.name}
                    </h1>
                    <p className="text-green-400 mb-4 max-w-2xl">
                      {collection.description}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="text-cyan-400">by {collection.creator}</span>
                      <Badge className="bg-green-400 text-black">
                        {collection.items.toLocaleString()} ITEMS
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-1">FLOOR_PRICE</p>
                  <p className="text-2xl font-bold text-cyan-400">{collection.floor} NERO</p>
                </div>
              </Card>
              
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-1">VOLUME</p>
                  <p className="text-2xl font-bold text-cyan-400">{collection.volume} NERO</p>
                </div>
              </Card>
              
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-1">OWNERS</p>
                  <p className="text-2xl font-bold text-cyan-400">{collection.owners.toLocaleString()}</p>
                </div>
              </Card>
              
              <Card className="bg-black border-cyan-400 border-2 p-6">
                <div className="text-center">
                  <p className="text-sm text-green-400 mb-1">ITEMS</p>
                  <p className="text-2xl font-bold text-cyan-400">{collection.items.toLocaleString()}</p>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button className="bg-cyan-400 text-black hover:bg-green-400 font-mono">
                <Heart className="w-4 h-4 mr-2" />
                FAVORITE
              </Button>
              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                <ExternalLink className="w-4 h-4 mr-2" />
                WEBSITE
              </Button>
              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono">
                <ExternalLink className="w-4 h-4 mr-2" />
                TWITTER
              </Button>
            </div>

            {/* NFT Items Grid */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-6 neon-text">
                 COLLECTION_ITEMS 
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nftItems.map((item) => (
                  <Card key={item.id} className="bg-black border-cyan-400 border-2 overflow-hidden hover:border-green-400 transition-colors group">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={`${getRarityColor(item.rarity)} text-white font-mono`}>
                          {item.rarity}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-bold text-cyan-400 mb-2 tracking-wider">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-green-400">PRICE</p>
                          <p className="text-sm text-cyan-400 font-bold">{item.price}</p>
                        </div>
                        <Button size="sm" className="bg-cyan-400 text-black hover:bg-green-400 font-mono text-xs">
                          BUY
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default CollectionDetail;
