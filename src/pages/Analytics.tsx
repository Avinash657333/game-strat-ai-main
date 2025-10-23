import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Target, Award } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalMatches: 0,
    improvement: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("analytics")
      .select(`
        *,
        matches (
          game_type,
          uploaded_at
        )
      `)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setAnalytics(data);
      
      const scores = data.map(a => Number(a.performance_score || 0));
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
      const improvement = scores.length > 1 
        ? ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100 
        : 0;

      setStats({
        avgScore: Math.round(avgScore * 10) / 10,
        totalMatches: data.length,
        improvement: Math.round(improvement),
      });
    }
    setLoading(false);
  };

  const chartData = analytics.map((a, index) => ({
    match: `Match ${index + 1}`,
    score: Number(a.performance_score || 0),
  }));

  const radarData = analytics.length > 0 ? [
    {
      category: "Strategy",
      value: Number(analytics[analytics.length - 1]?.performance_score || 0),
    },
    {
      category: "Execution",
      value: Math.random() * 100,
    },
    {
      category: "Teamwork",
      value: Math.random() * 100,
    },
    {
      category: "Positioning",
      value: Math.random() * 100,
    },
    {
      category: "Decision Making",
      value: Math.random() * 100,
    },
  ] : [];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Analytics Hub
              </span>
            </h1>
            <p className="text-muted-foreground">
              Visualize your performance trends and metrics
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : analytics.length === 0 ? (
            <Card className="p-12 bg-card/50 backdrop-blur-sm border-border text-center">
              <p className="text-muted-foreground">
                No analytics data yet. Upload and analyze matches to see your performance trends!
              </p>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-3xl font-bold text-primary">{stats.avgScore}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Matches</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalMatches}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Improvement</p>
                      <p className="text-3xl font-bold text-primary">
                        {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
                  <h3 className="text-xl font-semibold mb-4">Performance Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="match" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
                  <h3 className="text-xl font-semibold mb-4">Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="match" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Radar Chart */}
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
                <h3 className="text-xl font-semibold mb-4">Skill Breakdown</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                    <Radar
                      name="Performance"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
