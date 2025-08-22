import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

const generationData = [
  { day: "Mon", count: 5 },
  { day: "Tue", count: 8 },
  { day: "Wed", count: 6 },
  { day: "Thu", count: 10 },
  { day: "Fri", count: 7 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 9 },
];

const providerData = [
  { name: "openai", value: 18 },
  { name: "grok", value: 9 },
  { name: "gemini", value: 13 },
];

export default function Analytics() {
  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-github-text-secondary">Overview of recent activity</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-github-secondary border-github-border">
              <CardContent className="p-6">
                <p className="text-github-text-secondary text-sm">Total Generations (7d)</p>
                <p className="text-2xl font-bold">{generationData.reduce((a, b) => a + b.count, 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-github-secondary border-github-border">
              <CardContent className="p-6">
                <p className="text-github-text-secondary text-sm">Active Providers</p>
                <p className="text-2xl font-bold">{providerData.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-github-secondary border-github-border">
              <CardContent className="p-6">
                <p className="text-github-text-secondary text-sm">Best Day</p>
                <p className="text-2xl font-bold">{generationData.reduce((acc, cur) => (cur.count > acc.count ? cur : acc)).day}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle>Generations by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-72"
                  config={{
                    count: { label: "Generations", color: "hsl(280, 85%, 65%)" },
                  }}
                >
                  <LineChart data={generationData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-github-secondary border-github-border">
              <CardHeader>
                <CardTitle>Generations by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  className="h-72"
                  config={{
                    openai: { label: "OpenAI", color: "hsl(200, 90%, 60%)" },
                    grok: { label: "Grok", color: "hsl(340, 85%, 60%)" },
                    gemini: { label: "Gemini", color: "hsl(170, 85%, 50%)" },
                  }}
                >
                  <BarChart data={providerData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    <Bar dataKey="value" radius={4} fill="var(--color-openai)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
