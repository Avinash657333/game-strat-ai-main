import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, BarChart3, Brain, Clock, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("uploaded_at", { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive",
      });
    } else {
      setMatches(data || []);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 1024 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 1GB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Read file content
      const fileContent = await file.text();
      let matchData;

      try {
        matchData = JSON.parse(fileContent);
      } catch {
        // Non-JSON file: upload raw file to Supabase Storage and insert metadata-only record
        try {
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("uploads")
            .upload(filePath, file, {
              contentType: file.type || undefined,
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: publicUrlData } = supabase.storage
            .from("uploads")
            .getPublicUrl(filePath);

          const fileUrl = publicUrlData.publicUrl;

          const { error: insertError } = await supabase
            .from("matches")
            .insert({
              user_id: user.id,
              game_type: "Unknown",
              file_name: file.name,
              raw_data: null,
              status: "uploaded",
              file_url: fileUrl,
            });

          if (insertError) throw insertError;

          toast({
            title: "File uploaded",
            description: "Stored file successfully. JSON analysis is only run for JSON files.",
          });

          fetchMatches();
          return;
        } catch (e: any) {
          toast({
            title: "Upload failed",
            description: e.message || "Could not upload file",
            variant: "destructive",
          });
          return;
        }
      }

      // Insert match
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .insert({
          user_id: user.id,
          game_type: matchData.game_type || "Unknown",
          file_name: file.name,
          raw_data: matchData,
          status: "pending",
        })
        .select()
        .single();

      if (matchError) throw matchError;

      toast({
        title: "Match uploaded!",
        description: "Starting AI analysis...",
      });

      // Trigger analysis
      const { error: analysisError } = await supabase.functions.invoke(
        "analyze-match",
        {
          body: { matchId: match.id },
        }
      );

      if (analysisError) throw analysisError;

      toast({
        title: "Analysis complete!",
        description: "View your insights now",
      });

      fetchMatches();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMatch = async (matchId: string) => {
    const { error } = await supabase.from("matches").delete().eq("id", matchId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Match deleted",
      });
      fetchMatches();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-muted-foreground">
              Upload match data and view your analytics
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card-custom group">
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-neon transition-all duration-300">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Matches Uploaded</h3>
              <p className="text-3xl font-bold text-primary">{matches.length}</p>
            </Card>

            <Card
              className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card-custom group cursor-pointer"
              onClick={() => navigate("/analytics")}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-neon transition-all duration-300">
                <BarChart3 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Explore your performance metrics
              </p>
            </Card>

            <Card
              className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card-custom group cursor-pointer"
              onClick={() => navigate("/insights")}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-neon transition-all duration-300">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered recommendations
              </p>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border mb-8">
            <h2 className="text-2xl font-bold mb-6">Upload New Match</h2>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-all duration-300">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop your match file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                Support for JSON format (Max 1GB)
              </p>
              <Input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Button variant="outline" asChild disabled={uploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Choose File"
                  )}
                </label>
              </Button>
            </div>
          </Card>

          {/* Recent Matches */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm border-border">
            <h2 className="text-2xl font-bold mb-6">Recent Matches</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No matches yet. Upload your first match to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{match.file_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {match.game_type} •{" "}
                          {new Date(match.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      {match.status === "analyzed" && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          Analyzed
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {match.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={match.file_url} target="_blank" rel="noopener noreferrer">
                            Open File
                          </a>
                        </Button>
                      )}
                      {match.status === "analyzed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/insights?match=${match.id}`)}
                        >
                          View Analysis
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMatch(match.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
