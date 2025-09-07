import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Cookies = () => {
  return (
    <main className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Learn about how VapeFi uses cookies to enhance your experience.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">What Are Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              improving our service functionality.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Essential Cookies</h4>
              <p className="text-muted-foreground">
                These cookies are necessary for the website to function properly. They enable core 
                functionality such as security, network management, and accessibility.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Authentication and session management</li>
                <li>Wallet connection status</li>
                <li>User preferences and settings</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Functional Cookies</h4>
              <p className="text-muted-foreground">
                These cookies enhance the functionality of our website by remembering your choices 
                and providing enhanced features.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Language and region preferences</li>
                <li>Theme and display settings</li>
                <li>Tracking session preferences</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Analytics Cookies</h4>
              <p className="text-muted-foreground">
                These cookies help us understand how visitors interact with our website by 
                collecting and reporting information anonymously.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                <li>Website usage statistics</li>
                <li>Feature popularity metrics</li>
                <li>Performance optimization data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Managing Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have control over the cookies we use:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Browser settings: You can control cookies through your browser settings</li>
              <li>Essential cookies cannot be disabled as they are required for basic functionality</li>
              <li>Disabling certain cookies may limit some features of VapeFi</li>
              <li>Your preferences are saved locally and respected across sessions</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              VapeFi may use third-party services that set their own cookies for analytics and 
              functionality purposes. These services operate under their own privacy policies 
              and cookie practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our 
              practices or for legal and regulatory reasons. Please check this page periodically 
              for updates.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Cookies;