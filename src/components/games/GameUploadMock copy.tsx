import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { useToast } from "../ui/use-toast";
import {  Loader2, CheckCircle2, Upload } from "lucide-react";

const GAME_UPLOAD_STEPS = [
  { name: "Uploading Game Files", duration: 2000 },
  { name: "Processing Game Data", duration: 1500 },
  { name: "Deploying Smart Contract", duration: 2500 },
  { name: "Finalizing Deployment", duration: 1000 },
];

export const GameUploadMock = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const simulateUpload = async () => {
    setUploading(true);
    setCurrentStep(0);
    setProgress(0);

    try {
      for (let i = 0; i < GAME_UPLOAD_STEPS.length; i++) {
        setCurrentStep(i);
        
        // Simulate progress
        for (let j = 0; j < 100; j += 10) {
          await new Promise(resolve => setTimeout(resolve, GAME_UPLOAD_STEPS[i].duration / 10));
          setProgress((i * 100) + j);
        }
      }

      // Show success toast
      toast({
        title: "Game Upload Successful",
        description: "Your game has been successfully uploaded and deployed to the blockchain.",
        variant: "default",
      });

      setUploading(false);
      setProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Something went wrong while uploading your game. Please try again.",
        variant: "destructive",
      });
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Your Game</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={simulateUpload}
            disabled={uploading}
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
                <span>{GAME_UPLOAD_STEPS[currentStep].name}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {progress === 100 && (
            <div className="flex items-center justify-center py-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <span className="ml-2 text-green-500">Upload Complete</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
