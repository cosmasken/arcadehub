import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { useToast } from "../ui/use-toast";
import { Loader2, CheckCircle2, Upload } from "lucide-react";
import { usePinata } from "../../hooks/use-pinata";
import { useWalletStore } from "../../stores/useWalletStore";
import { ethers } from "ethers";

import { TESTNET_CONFIG } from '../../config';

const GAME_REGISTRY_ADDRESS = TESTNET_CONFIG.contracts.gameregistry;
const GAME_REGISTRY_ABI = [
  // Minimal ABI for uploadGame(string ipfsHash, string title, uint8 paymentType)
  "function uploadGame(string ipfsHash, string title, uint8 paymentType) external"
];

export const GameUploadMock = () => {
  const { toast } = useToast();
  const { uploading, error, ipfsHash, uploadFile } = usePinata();
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [gameTitle, setGameTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { aaSigner } = useWalletStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/zip") {
        toast({
          title: "Invalid File Type",
          description: "Please select a .zip file.",
          variant: "destructive",
        });
        e.target.value = "";
        setFile(null);
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    if (!gameTitle.trim()) {
      toast({
        title: "Missing Title",
        description: "Please enter a game title.",
        variant: "destructive",
      });
      return;
    }
    setProgress(0);
    const hash = await uploadFile(file);
    setProgress(100);
    if (hash) {
      toast({
        title: "Game Upload Successful",
        description: `Your game has been uploaded to IPFS. Hash: ${hash}`,
        variant: "default",
      });

      // Upload to GameRegistry contract with sponsorship (type 0)
      if (!aaSigner) {
        toast({
          title: "Wallet Not Connected",
          description: "Connect your wallet to register your game on-chain.",
          variant: "destructive",
        });
        return;
      }
      try {
        const contract = new ethers.Contract(
          GAME_REGISTRY_ADDRESS,
          GAME_REGISTRY_ABI,
          aaSigner
        );
        const tx = await contract.uploadGame(hash, gameTitle, 0); // 0 = sponsored
        toast({
          title: "On-chain Registration Sent",
          description: (
            <span>
              Transaction submitted. <a href={`https://testnet.neroscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">View on Neroscan</a>
            </span>
          ),
        });
        await tx.wait();
        toast({
          title: "Game Registered On-chain",
          description: "Your game is now registered on the ArcadeHub smart contract.",
        });
      } catch (err: any) {
        toast({
          title: "On-chain Registration Failed",
          description: err.message || "Failed to register game on-chain.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Upload Failed",
        description: error || "Something went wrong while uploading your game.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Your Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Game Title"
            value={gameTitle}
            onChange={e => setGameTitle(e.target.value)}
            className="block w-full mb-2 px-3 py-2 border rounded"
            disabled={uploading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
            disabled={uploading}
          />
          <Button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload Game Files"}
          </Button>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Uploading to IPFS</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {ipfsHash && (
            <div className="flex items-center justify-center py-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <span className="ml-2 text-green-500">
                Upload Complete:{" "}
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {ipfsHash}
                </a>
              </span>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};