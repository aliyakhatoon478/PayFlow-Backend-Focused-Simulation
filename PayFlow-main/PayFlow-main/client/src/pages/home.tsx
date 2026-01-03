import React, { useState, useEffect } from "react";
import { PayFlowService, PaymentRecord, PaymentRequest } from "@/lib/payflow-sim";
import { v4 as uuidv4 } from "uuid";
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Copy, 
  CreditCard, 
  Database, 
  History, 
  LayoutDashboard, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Terminal, 
  XCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function PayFlowDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form State
  const [amount, setAmount] = useState("100.00");
  const [currency, setCurrency] = useState("USD");
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
  const [lastResponse, setLastResponse] = useState<any>(null);

  const fetchPayments = async () => {
    const data = await PayFlowService.getAllPayments();
    setPayments(data);
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 2000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const req: PaymentRequest = {
        amount: parseFloat(amount),
        currency,
        sourceId: "src_card_" + Math.random().toString(36).substr(2, 5),
        destinationId: "dst_acct_" + Math.random().toString(36).substr(2, 5),
        idempotencyKey
      };

      const { payment, isIdempotentReplay } = await PayFlowService.initiatePayment(req);
      setLastResponse({ payment, isIdempotentReplay });
      
      if (isIdempotentReplay) {
        toast({
          title: "Idempotency Hit",
          description: `Request with key ${idempotencyKey} already exists. Returning cached result.`,
          variant: "default", 
        });
      } else {
        toast({
          title: "Payment Initiated",
          description: `Payment ${payment.id} created successfully.`,
          variant: "default",
        });
      }

      await fetchPayments();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to initiate payment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateKey = () => {
    setIdempotencyKey(uuidv4());
    setLastResponse(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "SUCCESS": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
      case "FAILED": return "bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      case "PROCESSING": return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Sidebar / Nav */}
      <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">PayFlow <span className="text-xs font-normal text-muted-foreground uppercase ml-1">Core</span></span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={() => { PayFlowService.reset(); fetchPayments(); }}>Reset Data</Button>
          <Button variant="outline" size="sm" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </Button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Terminal */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50 border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  Payment Gateway
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-xs">v1.0.0</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreatePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount & Currency</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        className="pl-7 font-mono" 
                      />
                    </div>
                    <Input 
                      value={currency} 
                      onChange={e => setCurrency(e.target.value)}
                      className="w-24 font-mono text-center" 
                      readOnly 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Idempotency Key</Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={regenerateKey}
                      title="Generate New Key"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="relative group">
                    <Input 
                      value={idempotencyKey} 
                      readOnly 
                      className="font-mono text-xs bg-slate-50 dark:bg-slate-900 text-muted-foreground border-dashed" 
                    />
                    <div className="absolute right-2 top-2 hidden group-hover:block">
                      <Badge variant="outline" className="bg-background text-[10px]">Unique Constraint</Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    This key ensures that retries with the same ID do not result in double charges.
                  </p>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Processing..." : "Initiate Transaction"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* API Response Console */}
          <Card className="bg-slate-950 text-slate-200 border-slate-800 shadow-xl">
            <CardHeader className="py-3 border-b border-slate-800">
              <CardTitle className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <Code2 className="h-3 w-3" />
                API RESPONSE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] w-full p-4 font-mono text-xs">
                {lastResponse ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`h-2 w-2 rounded-full ${lastResponse.isIdempotentReplay ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                      <span className="text-slate-400">
                        HTTP 200 OK {lastResponse.isIdempotentReplay && <span className="text-orange-400">(Cached)</span>}
                      </span>
                    </div>
                    <pre className="text-emerald-400/90 whitespace-pre-wrap">
                      {JSON.stringify(lastResponse.payment, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-slate-600 italic">Waiting for request...</div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dashboard & Logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  ${payments.reduce((acc, p) => p.status === 'SUCCESS' ? acc + p.amount : acc, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {payments.length > 0 
                    ? Math.round((payments.filter(p => p.status === 'SUCCESS').length / payments.length) * 100)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-blue-600">
                  {payments.filter(p => p.status === 'INITIATED' || p.status === 'PROCESSING').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-full min-h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction Ledger</CardTitle>
                  <CardDescription>Real-time view of the payment database</CardDescription>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full items-center">
                  <Database className="h-3 w-3 mr-1" />
                  PostgreSQL Replica: Connected
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="w-full text-sm text-left">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  <div className="col-span-3">Payment ID</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Idempotency Key</div>
                  <div className="col-span-2 text-right">Timestamp</div>
                </div>
                <ScrollArea className="h-[500px]">
                  <AnimatePresence initial={false}>
                    {payments.map((p) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors items-center group cursor-pointer"
                        onClick={() => setLastResponse({ payment: p, isIdempotentReplay: true })}
                      >
                        <div className="col-span-3 font-mono text-xs text-primary">{p.id}</div>
                        <div className="col-span-2 font-medium">{p.currency} {p.amount.toFixed(2)}</div>
                        <div className="col-span-2">
                          <Badge variant="outline" className={cn("text-[10px] h-5", getStatusColor(p.status))}>
                            {p.status}
                          </Badge>
                        </div>
                        <div className="col-span-3 font-mono text-[10px] text-muted-foreground truncate" title={p.idempotencyKey}>
                          {p.idempotencyKey}
                        </div>
                        <div className="col-span-2 text-right text-xs text-muted-foreground font-mono">
                          {new Date(p.createdAt).toLocaleTimeString()}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {payments.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                      <Activity className="h-8 w-8 mb-2 opacity-20" />
                      <p>No transactions recorded yet.</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
