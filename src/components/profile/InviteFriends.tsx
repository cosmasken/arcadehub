
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Share2, Copy, Link, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

const InviteFriends = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const inviteLink = `https://arcade.example.com/invite/${encodeURIComponent("GamerX")}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Invite link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareViaEmail = () => {
    window.open(
      `mailto:?subject=Join me on Arcade Platform&body=Hey! Join me on Arcade Platform: ${inviteLink}`,
      "_blank"
    );
  };

  const shareViaSocial = (platform: string) => {
    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent("Join me on Arcade Platform!")}`;
        break;
      case "instagram":
        // Instagram doesn't support direct sharing via URL, but we can inform the user
        toast({
          title: "Instagram sharing",
          description: "Copy the link and share it on Instagram manually.",
        });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  return (
    <Card className="bg-secondary border-muted/20 overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-arcade-purple/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 size={20} className="text-arcade-purple" />
          Invite Friends
        </CardTitle>
        <CardDescription>
          Invite your friends to join the arcade platform and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-3">
            <label htmlFor="invite-link" className="text-sm font-medium">
              Share your personal invite link
            </label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                value={inviteLink}
                readOnly
                className="bg-muted border-muted/30"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="border-white/20 hover:bg-white/5 min-w-20"
              >
                {copied ? "Copied!" : "Copy"}
                <Copy size={16} className={copied ? "text-arcade-green" : ""} />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-3">Share via</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="border-white/20 hover:bg-white/5 flex-1"
                onClick={() => shareViaEmail()}
              >
                <Mail size={16} />
                Email
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 hover:bg-white/5 flex-1"
                onClick={() => shareViaSocial("facebook")}
              >
                <Facebook size={16} />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 hover:bg-white/5 flex-1"
                onClick={() => shareViaSocial("twitter")}
              >
                <Twitter size={16} />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 hover:bg-white/5 flex-1"
                onClick={() => shareViaSocial("instagram")}
              >
                <Instagram size={16} />
                Instagram
              </Button>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg border border-muted/30">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Link size={16} className="text-arcade-blue" />
              Invite Benefits
            </h4>
            <ul className="text-sm space-y-1 text-white/70">
              <li>• You get 50 ARC tokens for each friend who joins</li>
              <li>• Your friends get 25 ARC tokens when they sign up</li>
              <li>• Unlock exclusive badges after 5 successful invites</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteFriends;
