import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Zap } from "lucide-react";

const NotFound = () => {
  return (
    <Layout>
      
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-grid-pattern flex items-center justify-center">
      <div className="text-center p-8 max-w-2xl mx-4 bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-purple-500/30 shadow-xl shadow-purple-500/10">
        <div className="inline-flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg shadow-purple-500/30">
          <Zap className="w-16 h-16 text-white" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
          404
        </h1>
        
        <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
        
        <p className="text-gray-300 mb-8 text-lg">
          The page you're looking for has been zapped out of existence.
          <br />
          Don't worry, you can always return to the main arena.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20">
            <Link to="/">
              Back to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="border-purple-500 text-purple-300 hover:bg-purple-900/50 hover:text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
            <Link to="/tournaments">
              Explore Tournaments
            </Link>
          </Button>
        </div>
        
        <div className="mt-10 text-sm text-gray-500">
          <p>Lost in space? <span className="text-purple-400">Contact support</span> if you need help.</p>
        </div>
      </div>
    </div>

    </Layout>
  );
};

export default NotFound;
