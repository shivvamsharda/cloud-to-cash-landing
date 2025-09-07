import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Please read these terms carefully before using VapeFi.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using VapeFi, you accept and agree to be bound by the terms and 
              provisions of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Service Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              VapeFi is a blockchain-based platform that tracks vaping sessions and rewards users 
              with tokens based on their activity.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Vaping session tracking using AI-powered detection</li>
              <li>Token rewards based on verified puff counts</li>
              <li>Leaderboard and competitive features</li>
              <li>Wallet integration for reward distribution</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">User Responsibilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              As a user of VapeFi, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Use the service only for legitimate vaping tracking purposes</li>
              <li>Not attempt to manipulate or falsify tracking data</li>
              <li>Keep your wallet credentials secure and private</li>
              <li>Comply with applicable laws and regulations in your jurisdiction</li>
              <li>Not engage in any fraudulent or malicious activities</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Rewards and Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Token rewards are distributed based on verified vaping activity:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Rewards are calculated automatically based on tracked sessions</li>
              <li>All rewards are subject to verification and validation</li>
              <li>VapeFi reserves the right to adjust reward mechanisms</li>
              <li>Tokens have no guaranteed monetary value</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Prohibited Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The following activities are strictly prohibited:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Attempting to game or exploit the tracking system</li>
              <li>Creating multiple accounts to increase rewards</li>
              <li>Sharing or selling account credentials</li>
              <li>Using automated tools to simulate vaping activity</li>
              <li>Engaging in any illegal activities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              VapeFi is provided "as is" without any warranties. We are not liable for any damages 
              arising from the use of our service, including but not limited to loss of tokens, 
              data, or other digital assets.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Terms;