import { useState, useEffect } from "react";
import { CompileHistoryList } from "@/components/CompileHistoryList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2, History, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import MistakesDashboard from "@/components/MistakesDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompileJob {
  id: string;
  created_at: string;
  status: string;
  raw_compiler_output: string | null;
  run_output: string | null;
  code: string;
}

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [compileHistory, setCompileHistory] = useState<CompileJob[]>([]);

  const fetchCompileHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('compile_history') || '[]');
      setCompileHistory(history);
    } catch (e) {
      console.error("Error loading history", e);
      toast.error("Failed to load local history");
    }
  };

  useEffect(() => {
    fetchCompileHistory();
    const handleStorageChange = () => fetchCompileHistory();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your compile history?")) {
      localStorage.removeItem('compile_history');
      fetchCompileHistory();
      toast.success("History cleared");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Editor</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="mr-2"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Code2 className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Settings & Analytics</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="mistakes" className="w-full">
            <div className="border-b border-border mb-8">
              <TabsList className="h-auto p-0 bg-transparent flex gap-8">
                <TabsTrigger
                  value="mistakes"
                  className="
                        rounded-none border-b-[3px] border-transparent px-4 py-3 
                        text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent
                        data-[state=active]:border-blue-500 data-[state=active]:text-foreground
                        transition-all duration-200
                    "
                >
                  <Code2 className="h-4 w-4 mr-2" />
                  Mistakes Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="
                        rounded-none border-b-[3px] border-transparent px-4 py-3 
                        text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent
                        data-[state=active]:border-blue-500 data-[state=active]:text-foreground
                        transition-all duration-200
                    "
                >
                  <History className="h-4 w-4 mr-2" />
                  Compile History
                </TabsTrigger>

              </TabsList>
            </div>

            <TabsContent value="mistakes" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MistakesDashboard />
            </TabsContent>

            <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">Compile History</h2>
                  <p className="text-[14px] text-muted-foreground mt-1">Your last {compileHistory.length} compilations</p>
                </div>
              </div>

              <CompileHistoryList history={compileHistory} onClear={handleClearHistory} />
            </TabsContent>


          </Tabs>
        </div>
      </main>
    </div>
  );
};
export default Settings;
