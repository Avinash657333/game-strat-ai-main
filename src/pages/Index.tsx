import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, BarChart3, Target, Zap, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Gaming Analytics" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>

        {/* Animated Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="h-full w-full bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 animate-slide-up">
          <div className="inline-block px-4 py-2 rounded-full border border-primary/50 bg-primary/10 backdrop-blur-sm mb-4">
            <span className="text-primary text-sm font-medium">AI-Powered Strategy Builder</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">GamePlanAI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Smarter Strategies, One Match at a Time
          </p>
          
          <p className="text-base md:text-lg text-foreground/80 max-w-3xl mx-auto">
            Upload your match data and unlock AI-driven insights, tactical heatmaps, and performance reports that elevate your competitive gaming.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">View Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            {[
              { label: "Matches Analyzed", value: "10K+" },
              { label: "Avg Win Rate Increase", value: "+15%" },
              { label: "Active Players", value: "5K+" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              <span className="text-primary">Next-Level</span> Analytics
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology meets competitive gaming to deliver insights that matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Strategy Insights",
                description: "Get personalized tactical recommendations based on your gameplay patterns and team dynamics"
              },
              {
                icon: BarChart3,
                title: "Dynamic Heatmaps",
                description: "Visualize positioning, engagement zones, and performance metrics with interactive heatmaps"
              },
              {
                icon: Target,
                title: "Weakness Analysis",
                description: "Identify improvement areas with detailed breakdowns of mistakes and missed opportunities"
              },
              {
                icon: Zap,
                title: "Instant Processing",
                description: "Upload match data and receive comprehensive analysis in seconds, not hours"
              },
              {
                icon: Upload,
                title: "Multi-Format Support",
                description: "Support for JSON and CSV match data from popular competitive titles"
              },
              {
                icon: Users,
                title: "Team Comparison",
                description: "Compare performance across multiple players with side-by-side analytics"
              },
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card-custom group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-neon transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-12 text-center">
            <div className="absolute inset-0 bg-gradient-glow opacity-50" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Level Up Your Game?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of competitive players using AI to dominate the competition
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Start Analyzing Now</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              GamePlanAI
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 GamePlanAI. Smarter Strategies, One Match at a Time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
