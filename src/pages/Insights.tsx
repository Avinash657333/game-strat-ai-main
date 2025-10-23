import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lightbulb, AlertCircle, Target, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Insights = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("match");
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, matchId]);

  const fetchInsights = async () => {
    setLoading(true);
    let query = supabase
      .from("analytics")
      .select(`
        *,
        matches (
          file_name,
          game_type,
          uploaded_at
        )
      `)
      .order("created_at", { ascending: false });

    if (matchId) {
      query = query.eq("match_id", matchId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setAnalytics(data);
    }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI Strategy Insights
              </span>
            </h1>
            <p className="text-muted-foreground">
              AI-powered tactical recommendations and improvement tips
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : analytics.length === 0 ? (
            <Card className="p-12 bg-card/50 backdrop-blur-sm border-border text-center">
              <p className="text-muted-foreground">
                No insights available yet. Analyze your matches to get AI-powered recommendations!
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {analytics.map((analysis) => (
                <Card
                  key={analysis.id}
                  className="p-8 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">
                        {analysis.matches?.file_name}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="outline">{analysis.matches?.game_type}</Badge>
                        <Badge variant="outline">
                          {new Date(analysis.matches?.uploaded_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Performance Score</p>
                      <p className="text-4xl font-bold text-primary">
                        {analysis.performance_score || 0}
                      </p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {analysis.ai_summary && (
                    <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">AI Summary</h4>
                      </div>
                      <p className="text-foreground/90">{analysis.ai_summary}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Key Mistakes */}
                    {analysis.key_mistakes && Array.isArray(analysis.key_mistakes) && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          <h4 className="font-semibold text-lg">Key Mistakes</h4>
                        </div>
                        <ul className="space-y-2">
                          {analysis.key_mistakes.map((mistake: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                            >
                              <span className="text-destructive font-semibold">{i + 1}.</span>
                              <span className="text-sm">{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvement Tips */}
                    {analysis.improvement_tips && Array.isArray(analysis.improvement_tips) && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          <h4 className="font-semibold text-lg">Improvement Tips</h4>
                        </div>
                        <ul className="space-y-2">
                          {analysis.improvement_tips.map((tip: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20"
                            >
                              <span className="text-primary font-semibold">{i + 1}.</span>
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Strategic Plan */}
                  {analysis.strategic_plan && Array.isArray(analysis.strategic_plan) && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold text-lg">Strategic Plan for Next Match</h4>
                      </div>
                      <div className="space-y-3">
                        {analysis.strategic_plan.map((plan: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-primary-foreground">
                                  {plan.step || i + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium mb-1">Step {plan.step || i + 1}</p>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Insights;
