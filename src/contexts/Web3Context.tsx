
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock Web3Auth types and interfaces
interface MockUser {
  name?: string;
  email?: string;
  profileImage?: string;
  verifier?: string;
  verifierId?: string;
}

interface MockProvider {
  request: (args: any) => Promise<any>;
}

interface Web3ContextType {
  web3auth: any;
  provider: MockProvider | null;
  user: MockUser | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<MockUser | null>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

// Mock users for demo
const mockUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    verifier: "google",
    verifierId: "john@example.com"
  },
  {
    name: "Alice Smith",
    email: "alice@example.com", 
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    verifier: "facebook",
    verifierId: "alice@example.com"
  },
  {
    name: "Bob Wilson",
    email: "bob@example.com",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    verifier: "twitter",
    verifierId: "bob@example.com"
  }
];

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3auth, setWeb3auth] = useState<any>(null);
  const [provider, setProvider] = useState<MockProvider | null>(null);
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Mock Web3Auth initialization
        const mockWeb3Auth = {
          connected: false,
          provider: null,
          initModal: async () => {
            console.log("Mock Web3Auth initialized");
          },
          connect: async () => {
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            mockWeb3Auth.connected = true;
            mockWeb3Auth.provider = {
              request: async (args: any) => {
                console.log("Mock provider request:", args);
                return "0x1234567890abcdef";
              }
            };
            return mockWeb3Auth.provider;
          },
          getUserInfo: async () => {
            if (mockWeb3Auth.connected) {
              const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
              return randomUser;
            }
            return null;
          },
          logout: async () => {
            mockWeb3Auth.connected = false;
            mockWeb3Auth.provider = null;
            console.log("Mock logout completed");
          }
        };

        setWeb3auth(mockWeb3Auth);
        await mockWeb3Auth.initModal();

        // Simulate checking for existing session
        if (Math.random() > 0.8) { // 20% chance of being "already connected"
          mockWeb3Auth.connected = true;
          const mockProvider = {
            request: async (args: any) => {
              console.log("Mock provider request:", args);
              return "0x1234567890abcdef";
            }
          };
          setProvider(mockProvider);
          const userData = await mockWeb3Auth.getUserInfo();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing Mock Web3Auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("Mock Web3Auth not initialized yet");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      const userData = await web3auth.getUserInfo();
      setUser(userData);
      console.log("Mock login successful:", userData);
    } catch (error) {
      console.error('Mock login error:', error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("Mock Web3Auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setUser(null);
      console.log("Mock logout successful");
    } catch (error) {
      console.error('Mock logout error:', error);
    }
  };

  const getUserInfo = async () => {
    if (web3auth) {
      const userData = await web3auth.getUserInfo();
      setUser(userData);
      return userData;
    }
    return null;
  };

  return (
    <Web3Context.Provider
      value={{
        web3auth,
        provider,
        user,
        isLoading,
        login,
        logout,
        getUserInfo,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
