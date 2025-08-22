import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Settings() {
  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-github-text-secondary">Manage your app preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle>General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Show Tips</Label>
                    <p className="text-sm text-github-text-secondary">Display helpful tips in tools</p>
                  </div>
                  <Switch aria-label="toggle tips" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Confirm Before Deleting</Label>
                    <p className="text-sm text-github-text-secondary">Ask for confirmation on destructive actions</p>
                  </div>
                  <Switch aria-label="toggle confirmations" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Safe Mode</Label>
                    <p className="text-sm text-github-text-secondary">Use conservative prompts by default</p>
                  </div>
                  <Switch aria-label="toggle safe mode" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Save History</Label>
                    <p className="text-sm text-github-text-secondary">Store generations for analytics</p>
                  </div>
                  <Switch aria-label="toggle history" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
