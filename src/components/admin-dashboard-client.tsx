"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Shield,
  Eye,
  Check,
  X,
  Flag,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Building,
  Loader2,
  CheckSquare2,
  FileText,
  Key,
  Search,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/contexts/reports-context";
import LogoutButton from "@/components/logout-button";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import ThreatNodeGraph from "@/components/threat-node-graph";

interface SafeCompany {
  id: string;
  name: string;
  industry: string;
  description: string;
  website: string | null;
  verified_score: number;
  tags: string[] | null;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminDashboardClient() {
  const { toast } = useToast();
  const {
    reports,
    approveReport,
    rejectReport,
    deleteReport,
    resolveReportFlags,
  } = useReports();

  const [safeCompanies, setSafeCompanies] = useState<SafeCompany[]>([]);
  const [isLoadingSafeCompanies, setIsLoadingSafeCompanies] = useState(true);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // API Keys States
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);

  // Payment Requests States
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [keySearchQuery, setKeySearchQuery] = useState("");

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const keysSnapshot = await getDocs(collection(db, "api_keys"));
      const fetchedKeys: any[] = [];
      keysSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedKeys.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
        });
      });
      setApiKeys(fetchedKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Database Error",
        description: "Failed to load active API keys.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const fetchPaymentRequests = async () => {
    setIsLoadingPayments(true);
    try {
      const q = query(
        collection(db, "payment_requests"),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      const fetched: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
        });
      });
      setPaymentRequests(fetched);
    } catch (error) {
      console.error("Error fetching payment requests:", error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    const fetchSafeCompanies = async () => {
      setIsLoadingSafeCompanies(true);
      try {
        const q = query(
          collection(db, "safe_companies"),
          orderBy("created_at", "desc"),
        );
        const querySnapshot = await getDocs(q);

        const fetchedCompanies: SafeCompany[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCompanies.push({
            id: doc.id,
            name: data.name,
            industry: data.industry,
            description: data.description,
            website: data.website,
            verified_score: data.verified_score,
            tags: data.tags,
            created_at: data.created_at?.toDate
              ? data.created_at.toDate().toISOString()
              : data.created_at || new Date().toISOString(),
            status: data.status,
          });
        });

        setSafeCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Error fetching safe companies:", error);
        toast({
          title: "Database Error",
          description: "Failed to load safe company submissions.",
          variant: "destructive",
        });
      }
      setIsLoadingSafeCompanies(false);
    };

    fetchSafeCompanies();
    fetchApiKeys();
    fetchPaymentRequests();
  }, [toast]);

  const pendingReports = reports.filter(
    (report) => report.status === "pending",
  );
  const flaggedReports = reports.filter(
    (report) => report.flagCount > 0 && report.status === "approved",
  );
  const approvedReports = reports.filter(
    (report) => report.status === "approved",
  );
  const pendingSafeCompanies = safeCompanies.filter(
    (company) => company.status === "pending",
  );

  const handleApprove = async (id: string) => {
    await approveReport(id);
    toast({
      title: "Report Approved",
      description:
        "The report has been approved and published to the directory.",
    });
  };

  const handleReject = async (id: string) => {
    await rejectReport(id);
    toast({
      title: "Report Rejected",
      description: "The report submission has been rejected.",
      variant: "destructive",
    });
  };

  const handleDelete = async (id: string) => {
    await deleteReport(id);
    toast({
      title: "Report Deleted",
      description: "The report has been permanently deleted.",
      variant: "destructive",
    });
  };

  const handleResolveFlagged = async (id: string) => {
    try {
      if (resolveReportFlags) {
        await resolveReportFlags(id);
      }
      toast({
        title: "Flags Resolved",
        description: "The report flag state has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve report flags.",
        variant: "destructive",
      });
    }
  };

  const handleApproveSafeCompany = async (
    id: string,
    suppressToast = false,
  ) => {
    try {
      const companyRef = doc(db, "safe_companies", id);
      await updateDoc(companyRef, { status: "approved" });
      setSafeCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
      );
      if (!suppressToast) {
        toast({
          title: "Company Approved",
          description: "The company has been added to the verified directory.",
        });
      }
    } catch (error) {
      if (!suppressToast) {
        toast({
          title: "Error",
          description: "Failed to approve the company proposal.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleRejectSafeCompany = async (id: string, suppressToast = false) => {
    try {
      const companyRef = doc(db, "safe_companies", id);
      await updateDoc(companyRef, { status: "rejected" });
      setSafeCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)),
      );
      if (!suppressToast) {
        toast({
          title: "Company Rejected",
          description: "The company submission has been rejected.",
        });
      }
    } catch (error) {
      if (!suppressToast) {
        toast({
          title: "Error",
          description: "Failed to reject company.",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleDeleteSafeCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, "safe_companies", id));
      setSafeCompanies((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Company Deleted",
        description: "The company has been deleted from the database.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Delete operation failed.",
        variant: "destructive",
      });
    }
  };

  // Bulk actions for reports
  const handleBulkApproveReports = async () => {
    try {
      await Promise.all(selectedReports.map((id) => approveReport(id)));
      setSelectedReports([]);
      toast({
        title: "Reports Approved",
        description: `${selectedReports.length} reports have been successfully approved.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk approval operation failed.",
        variant: "destructive",
      });
    }
  };

  const handleBulkRejectReports = async () => {
    try {
      await Promise.all(selectedReports.map((id) => rejectReport(id)));
      setSelectedReports([]);
      toast({
        title: "Reports Rejected",
        description: `${selectedReports.length} reports have been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk rejection operation failed.",
        variant: "destructive",
      });
    }
  };

  // Bulk actions for companies
  const handleBulkApproveCompanies = async () => {
    try {
      const count = selectedCompanies.length;
      await Promise.all(
        selectedCompanies.map((id) => handleApproveSafeCompany(id, true)),
      );
      setSelectedCompanies([]);
      toast({
        title: "Companies Approved",
        description: `${count} companies added to the verified directory.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk approval operation failed.",
        variant: "destructive",
      });
    }
  };

  const handleBulkRejectCompanies = async () => {
    try {
      const count = selectedCompanies.length;
      await Promise.all(
        selectedCompanies.map((id) => handleRejectSafeCompany(id, true)),
      );
      setSelectedCompanies([]);
      toast({
        title: "Companies Rejected",
        description: `${count} company submissions have been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk rejection operation failed.",
        variant: "destructive",
      });
    }
  };

  // API Key Actions
  const handleToggleKeyStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "revoked" : "active";
    try {
      const keyRef = doc(db, "api_keys", id);
      await updateDoc(keyRef, { status: newStatus });
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: newStatus } : k)),
      );
      toast({
        title: `API Key ${newStatus === "active" ? "Reactivated" : "Revoked"}`,
        description: `Successfully updated the API key status to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "Could not modify API key status.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateKeyTier = async (id: string, tier: string) => {
    let planLimit = 1000;
    if (tier === "pro") planLimit = 50000;
    if (tier === "enterprise") planLimit = 500000;

    try {
      const keyRef = doc(db, "api_keys", id);
      await updateDoc(keyRef, { tier, planLimit });
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, tier, planLimit } : k)),
      );
      toast({
        title: "API Key Tier Updated",
        description: `Successfully upgraded/downgraded key to ${tier.toUpperCase()} with limit ${planLimit.toLocaleString()}.`,
      });
    } catch (error) {
      toast({
        title: "Error updating tier",
        description: "Could not modify key tier.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCustomLimit = async (id: string, currentLimit: number) => {
    const promptValue = window.prompt(
      "Enter new custom monthly quota limit:",
      currentLimit.toString(),
    );
    if (promptValue === null) return;
    const limit = parseInt(promptValue, 10);
    if (isNaN(limit) || limit < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid positive integer value.",
        variant: "destructive",
      });
      return;
    }

    try {
      const keyRef = doc(db, "api_keys", id);
      await updateDoc(keyRef, { planLimit: limit });
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, planLimit: limit } : k)),
      );
      toast({
        title: "Custom Limit Configured",
        description: `Successfully set quota limit to ${limit.toLocaleString()} monthly requests.`,
      });
    } catch (error) {
      toast({
        title: "Error updating limit",
        description: "Could not set custom limit.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKey = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this API key? This action is irreversible.",
    );
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "api_keys", id));
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      toast({
        title: "API Key Deleted",
        description: "Key document has been permanently deleted from database.",
      });
    } catch (error) {
      toast({
        title: "Error deleting key",
        description: "Failed to delete API key.",
        variant: "destructive",
      });
    }
  };

  const handleApprovePayment = async (payment: any) => {
    try {
      // 1. Find the user's currently active API key (in case they rotated it)
      const activeKeysQuery = query(
        collection(db, "api_keys"),
        where("userId", "==", payment.userId),
        where("status", "==", "active"),
      );
      const activeKeysSnap = await getDocs(activeKeysQuery);

      let targetKeyId = payment.apiKeyId;
      if (!activeKeysSnap.empty) {
        targetKeyId = activeKeysSnap.docs[0].id;
      }

      // 2. Update the user's API key tier and planLimit
      const keyRef = doc(db, "api_keys", targetKeyId);
      const newLimit =
        payment.requestedTier === "enterprise"
          ? 500000
          : payment.requestedTier === "pro"
            ? 50000
            : 1000;
      await updateDoc(keyRef, {
        tier: payment.requestedTier,
        planLimit: newLimit,
      });

      // 3. Mark payment as approved
      const paymentRef = doc(db, "payment_requests", payment.id);
      await updateDoc(paymentRef, {
        status: "approved",
        reviewedAt: new Date().toISOString(),
      });

      // 4. Update local state
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: "approved" } : p,
        ),
      );
      setApiKeys((prev) =>
        prev.map((k) =>
          k.id === targetKeyId
            ? { ...k, tier: payment.requestedTier, planLimit: newLimit }
            : k,
        ),
      );

      toast({
        title: "Payment Approved",
        description: `User ${payment.email} has been upgraded to ${payment.requestedTier.toUpperCase()} plan.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve payment.",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (payment: any) => {
    try {
      const paymentRef = doc(db, "payment_requests", payment.id);
      await updateDoc(paymentRef, {
        status: "rejected",
        reviewedAt: new Date().toISOString(),
      });
      setPaymentRequests((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: "rejected" } : p,
        ),
      );
      toast({
        title: "Payment Rejected",
        description: `Payment request from ${payment.email} has been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject payment.",
        variant: "destructive",
      });
    }
  };

  // Filter API keys by search query
  const filteredKeys = apiKeys.filter((k) => {
    const query = keySearchQuery.toLowerCase();
    return (
      (k.email && k.email.toLowerCase().includes(query)) ||
      (k.userId && k.userId.toLowerCase().includes(query)) ||
      (k.key && k.key.toLowerCase().includes(query))
    );
  });

  const stats = [
    {
      name: "Quarantined Reports",
      value: pendingReports.length,
      icon: Eye,
      color: "text-warning",
      bgColor: "bg-warning/10 border-warning/20",
    },
    {
      name: "Flagged Reports",
      value: flaggedReports.length,
      icon: Flag,
      color: "text-destructive",
      bgColor: "bg-destructive/10 border-destructive/20",
    },
    {
      name: "Pending Whitelist",
      value: pendingSafeCompanies.length,
      icon: Building,
      color: "text-success",
      bgColor: "bg-success/10 border-success/20",
    },
    {
      name: "Total Directory Reports",
      value: reports.length,
      icon: Shield,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
    },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Parse Daily Scan Counts for Time-Series Area Chart
  const getTimelineData = () => {
    const dailyCounts: Record<string, number> = {};
    const sortedReports = [...reports].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    sortedReports.forEach((report) => {
      const dateStr = new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    });

    const dataPoints = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      scans: count,
    }));

    if (dataPoints.length === 0) {
      return [
        { date: "May 18", scans: 4 },
        { date: "May 19", scans: 10 },
        { date: "May 20", scans: 6 },
        { date: "May 21", scans: 15 },
        { date: "May 22", scans: 12 },
        { date: "May 23", scans: 22 },
      ];
    }
    return dataPoints;
  };

  // Parse Risk Distribution Counts for Dynamic Pie Chart
  const getRiskDistributionData = () => {
    const riskCounts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    reports.forEach((r) => {
      const level = r.riskLevel?.toLowerCase();
      if (level in riskCounts) riskCounts[level]++;
    });

    if (reports.length === 0) {
      return [
        { name: "High Risk", value: 35, color: "#ef4444" },
        { name: "Medium Risk", value: 45, color: "#f97316" },
        { name: "Low Risk", value: 20, color: "#10b981" },
      ];
    }

    return [
      { name: "High Risk", value: riskCounts.high, color: "#ef4444" },
      { name: "Medium Risk", value: riskCounts.medium, color: "#f97316" },
      { name: "Low Risk", value: riskCounts.low, color: "#10b981" },
    ].filter((item) => item.value > 0);
  };

  return (
    <div className="min-h-screen bg-background py-10 relative overflow-hidden font-sans text-foreground">
      {/* Soft Decorative Background */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.05]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header Panel */}
          <div className="glass-card rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-20 pointer-events-none" />
            <div className="text-left relative z-10">
              <div className="flex items-center mb-2">
                <Shield className="h-7 w-7 text-primary mr-3 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Admin Control Panel
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-muted-foreground border-l border-white/10 pl-3">
                  System Administration & Moderation Console
                </p>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Secure Session
                </Badge>
              </div>
            </div>
            <div className="relative z-10">
              <LogoutButton />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="glass-card rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 relative group overflow-hidden transition-all duration-300 shadow-lg hover:scale-[1.01] hover:border-primary/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                    {stat.name}
                  </span>
                  <div
                    className={cn(
                      "p-2 rounded-xl bg-slate-950/40 border border-white/5",
                      stat.color,
                    )}
                  >
                    <stat.icon className="h-4.5 w-4.5 opacity-90" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Management */}
          <Tabs defaultValue="pending-reports" className="space-y-6">
            <TabsList className="bg-slate-950/45 border border-white/5 rounded-xl p-1.5 h-auto flex-wrap sm:flex-nowrap gap-1 shadow-inner backdrop-blur-md">
              <TabsTrigger
                value="pending-reports"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 border border-transparent hover:text-foreground/80"
              >
                Quarantine Queue ({pendingReports.length})
              </TabsTrigger>
              <TabsTrigger
                value="flagged-reports"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:border-destructive/20 border border-transparent hover:text-foreground/80"
              >
                Flagged Reports ({flaggedReports.length})
              </TabsTrigger>
              <TabsTrigger
                value="approved-reports"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 border border-transparent hover:text-foreground/80"
              >
                Approved Directory ({approvedReports.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending-companies"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary data-[state=active]:border-secondary/20 border border-transparent hover:text-foreground/80"
              >
                Pending Whitelist ({pendingSafeCompanies.length})
              </TabsTrigger>
              <TabsTrigger
                value="api-keys"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 border border-transparent hover:text-foreground/80"
              >
                API Keys ({apiKeys.length})
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/20 border border-transparent hover:text-foreground/80"
              >
                Payments (
                {paymentRequests.filter((p) => p.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="rounded-lg px-4 py-2.5 text-xs font-semibold tracking-wide transition-all data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:border-primary/10 border border-transparent hover:text-foreground/80"
              >
                Analytics & Metrics
              </TabsTrigger>
            </TabsList>

            {/* Quarantine Reports Content */}
            <TabsContent
              value="pending-reports"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-950/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-primary" /> Reports
                    Awaiting Moderation
                  </h3>
                  <Badge className="bg-slate-950/50 border border-white/5 text-muted-foreground text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                    Requires Review
                  </Badge>
                </div>

                <div className="p-4 bg-slate-900/20">
                  {selectedReports.length > 0 && (
                    <div className="flex justify-end space-x-2.5 animate-in fade-in duration-200">
                      <Button
                        variant="outline"
                        onClick={handleBulkApproveReports}
                        className="h-9 rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all font-semibold text-xs px-4"
                      >
                        Approve Selected ({selectedReports.length})
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleBulkRejectReports}
                        className="h-9 rounded-xl font-semibold text-xs px-4 shadow-lg shadow-destructive/10"
                      >
                        Reject Selected ({selectedReports.length})
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-0">
                  {pendingReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-12 text-center"></TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Report Title
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Category
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Risk Level
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Submitted At
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingReports.map((report) => (
                            <TableRow
                              key={report.id}
                              className="border-white/5 hover:bg-slate-950/25 transition-colors"
                            >
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={selectedReports.includes(report.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedReports((prev) => [
                                        ...prev,
                                        report.id,
                                      ]);
                                    } else {
                                      setSelectedReports((prev) =>
                                        prev.filter((id) => id !== report.id),
                                      );
                                    }
                                  }}
                                  className="h-4.5 w-4.5 rounded border-white/10 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-foreground max-w-[240px] truncate">
                                {report.title}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-2.5 py-0.5 text-xs text-muted-foreground border-white/5 bg-slate-950/50"
                                >
                                  {report.scamType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize shadow-sm",
                                    getRiskColor(report.riskLevel),
                                  )}
                                >
                                  {report.riskLevel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-mono">
                                {new Date(report.createdAt).toLocaleString(
                                  undefined,
                                  { dateStyle: "medium", timeStyle: "short" },
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => handleApprove(report.id)}
                                    className="h-8 w-8 rounded-lg border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => handleReject(report.id)}
                                    className="h-8 w-8 rounded-lg border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(report.id)}
                                    className="h-8 w-8 rounded-lg shadow-sm shadow-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-900/10">
                      <Check className="h-10 w-10 text-emerald-500/30 mx-auto mb-4 animate-bounce" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Queue Empty
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        All submitted threat reports have been successfully
                        reviewed and resolved.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Flagged Reports Content */}
            <TabsContent
              value="flagged-reports"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-950/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                    <Flag className="h-4.5 w-4.5 text-destructive animate-pulse" />{" "}
                    Active Community Flags
                  </h3>
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    High Alert
                  </Badge>
                </div>

                <div className="p-0">
                  {flaggedReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Report Title
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Flag Density
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Confidence Score
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flaggedReports.map((report) => (
                            <TableRow
                              key={report.id}
                              className="border-white/5 hover:bg-destructive/5 transition-colors"
                            >
                              <TableCell className="font-medium text-foreground max-w-[240px] truncate">
                                {report.title}
                              </TableCell>
                              <TableCell className="text-destructive font-semibold text-xs">
                                {report.flagCount} community flags
                              </TableCell>
                              <TableCell>
                                <Badge className="rounded-full bg-slate-950/50 border border-white/5 text-xs text-primary py-0.5 px-2.5 font-mono">
                                  {report.trustScore}% confidence rating
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleResolveFlagged(report.id)
                                    }
                                    className="h-8 rounded-lg text-xs font-semibold px-3 border-white/10 hover:bg-slate-950/45 text-foreground transition-all"
                                  >
                                    Clear Flags
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(report.id)}
                                    className="h-8 w-8 rounded-lg shadow-sm shadow-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-900/10">
                      <Shield className="h-10 w-10 text-primary/30 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Radar Clear
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        No published reports currently carry warnings or
                        community flags.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Approved Reports Directory Content */}
            <TabsContent
              value="approved-reports"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-950/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <Check className="h-4.5 w-4.5 text-emerald-400" /> Active
                    Threat Database
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Synchronized
                  </Badge>
                </div>

                <div className="p-0">
                  {approvedReports.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Report Title
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Category
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Risk Level
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Published At
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {approvedReports.map((report) => (
                            <TableRow
                              key={report.id}
                              className="border-white/5 hover:bg-slate-950/25 transition-colors"
                            >
                              <TableCell className="font-medium text-foreground max-w-[240px] truncate">
                                {report.title}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-2.5 py-0.5 text-xs text-muted-foreground border-white/5 bg-slate-950/50"
                                >
                                  {report.scamType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                                    getRiskColor(report.riskLevel),
                                  )}
                                >
                                  {report.riskLevel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-mono">
                                {new Date(report.createdAt).toLocaleString(
                                  undefined,
                                  { dateStyle: "medium", timeStyle: "short" },
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(report.id)}
                                    className="h-8 w-8 rounded-lg shadow-sm shadow-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-900/10">
                      <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Database Empty
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        There are no approved threat reports in the active
                        registry.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Whitelist Queue Content */}
            <TabsContent
              value="pending-companies"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-950/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-secondary flex items-center gap-2">
                    <Building className="h-4.5 w-4.5 text-secondary" />{" "}
                    Whitelist Submission Proposals
                  </h3>
                  <Badge className="bg-secondary/10 text-secondary border border-secondary/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Vetting Queue
                  </Badge>
                </div>

                <div className="p-4 bg-slate-900/20">
                  {selectedCompanies.length > 0 && (
                    <div className="flex justify-end space-x-2.5 animate-in fade-in duration-200">
                      <Button
                        variant="outline"
                        onClick={handleBulkApproveCompanies}
                        className="h-9 rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all font-semibold text-xs px-4"
                      >
                        Approve Selected ({selectedCompanies.length})
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleBulkRejectCompanies}
                        className="h-9 rounded-xl font-semibold text-xs px-4 shadow-lg shadow-destructive/10"
                      >
                        Reject Selected ({selectedCompanies.length})
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-0">
                  {isLoadingSafeCompanies ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                    </div>
                  ) : pendingSafeCompanies.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-12 text-center"></TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Company Name
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Industry
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Trust Rating
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Website
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Submitted At
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingSafeCompanies.map((company) => (
                            <TableRow
                              key={company.id}
                              className="border-white/5 hover:bg-slate-950/25 transition-colors"
                            >
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={selectedCompanies.includes(
                                    company.id,
                                  )}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCompanies((prev) => [
                                        ...prev,
                                        company.id,
                                      ]);
                                    } else {
                                      setSelectedCompanies((prev) =>
                                        prev.filter((id) => id !== company.id),
                                      );
                                    }
                                  }}
                                  className="h-4.5 w-4.5 rounded border-white/10 data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                                />
                              </TableCell>
                              <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                                {company.name}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs uppercase font-mono">
                                {company.industry}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-950/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                      className="bg-secondary h-full rounded-full"
                                      style={{
                                        width: `${company.verified_score}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-secondary font-mono">
                                    {company.verified_score}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {company.website ? (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-semibold text-xs transition-colors"
                                  >
                                    View Website
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground/30 text-xs">
                                    None
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-mono">
                                {new Date(company.created_at).toLocaleString(
                                  undefined,
                                  { dateStyle: "medium", timeStyle: "short" },
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleApproveSafeCompany(company.id)
                                    }
                                    className="h-8 rounded-lg text-xs font-semibold border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all px-2.5 shadow-sm"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRejectSafeCompany(company.id)
                                    }
                                    className="h-8 rounded-lg text-xs font-semibold border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-all px-2.5 shadow-sm"
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteSafeCompany(company.id)
                                    }
                                    className="h-8 w-8 rounded-lg shadow-sm shadow-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-900/10">
                      <Building className="h-10 w-10 text-secondary/30 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        Queue Clear
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        There are no pending company whitelist proposals
                        currently requiring review.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* API Keys Management Content */}
            <TabsContent
              value="api-keys"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="space-y-6">
                {/* Key Metrics Summary Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:border-primary/30 transition-all duration-300">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Total Keys Issued
                    </span>
                    <span className="text-3xl font-extrabold text-foreground mt-2 block font-mono">
                      {apiKeys.length}
                    </span>
                  </div>
                  <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:border-emerald-500/30 transition-all duration-300">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Active Keys
                    </span>
                    <span className="text-3xl font-extrabold text-emerald-400 mt-2 block font-mono">
                      {apiKeys.filter((k) => k.status === "active").length}
                    </span>
                  </div>
                  <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:border-destructive/30 transition-all duration-300">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Revoked Keys
                    </span>
                    <span className="text-3xl font-extrabold text-destructive mt-2 block font-mono">
                      {apiKeys.filter((k) => k.status === "revoked").length}
                    </span>
                  </div>
                  <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:border-primary/30 transition-all duration-300">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Premium Tiers (Pro/Ent)
                    </span>
                    <span className="text-3xl font-extrabold text-primary mt-2 block font-mono">
                      {
                        apiKeys.filter(
                          (k) => k.tier === "pro" || k.tier === "enterprise",
                        ).length
                      }
                    </span>
                  </div>
                </div>

                {/* Main Keys Registry Table */}
                <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-slate-950/40 border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Key className="h-4.5 w-4.5 text-primary" /> API Key
                        Registry & Plans
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Manage user developer access keys, adjust subscription
                        tiers, and edit plan quotas.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72 shrink-0">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/45" />
                      <input
                        type="text"
                        placeholder="Search by email, user ID, or key..."
                        value={keySearchQuery}
                        onChange={(e) => setKeySearchQuery(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 focus:border-primary/50 text-xs pl-9 pr-3 py-2 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-lg transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-0">
                    {isLoadingKeys ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredKeys.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table className="text-sm">
                          <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                User / Email
                              </TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                API Key
                              </TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Plan Tier
                              </TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Monthly Quota Usage
                              </TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Status
                              </TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Issued At
                              </TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredKeys.map((keyData) => {
                              const usagePercent = Math.min(
                                ((keyData.usageCount || 0) /
                                  (keyData.planLimit || 1000)) *
                                  100,
                                100,
                              );
                              return (
                                <TableRow
                                  key={keyData.id}
                                  className="border-white/5 hover:bg-slate-950/25 transition-colors"
                                >
                                  <TableCell className="max-w-[200px] truncate">
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-foreground">
                                        {keyData.email || "No email logged"}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground truncate font-mono">
                                        {keyData.userId}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    <div className="flex items-center gap-1">
                                      <span className="bg-slate-950/60 border border-white/5 px-2 py-0.5 rounded text-primary text-[11px] font-mono">
                                        {keyData.key
                                          ? `${keyData.key.substring(0, 12)}...${keyData.key.slice(-4)}`
                                          : "ss_live_..."}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <select
                                      value={keyData.tier || "free"}
                                      onChange={(e) =>
                                        handleUpdateKeyTier(
                                          keyData.id,
                                          e.target.value,
                                        )
                                      }
                                      className="bg-slate-950/60 border border-white/5 rounded-lg text-xs p-1 outline-none text-foreground font-semibold cursor-pointer focus:border-primary/50 transition-colors"
                                    >
                                      <option
                                        value="free"
                                        className="bg-slate-900 text-foreground"
                                      >
                                        Free
                                      </option>
                                      <option
                                        value="pro"
                                        className="bg-slate-900 text-foreground"
                                      >
                                        Pro
                                      </option>
                                      <option
                                        value="enterprise"
                                        className="bg-slate-900 text-foreground"
                                      >
                                        Enterprise
                                      </option>
                                    </select>
                                  </TableCell>
                                  <TableCell className="w-[180px]">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex justify-between text-[11px] font-medium font-mono">
                                        <span className="text-muted-foreground">
                                          {(
                                            keyData.usageCount || 0
                                          ).toLocaleString()}{" "}
                                          /{" "}
                                          {(
                                            keyData.planLimit || 1000
                                          ).toLocaleString()}
                                        </span>
                                        <span className="text-foreground font-bold">
                                          {Math.round(usagePercent)}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-950/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                          className={cn(
                                            "h-full rounded-full transition-all duration-300",
                                            usagePercent >= 90
                                              ? "bg-destructive"
                                              : usagePercent >= 75
                                                ? "bg-warning"
                                                : "bg-primary",
                                          )}
                                          style={{ width: `${usagePercent}%` }}
                                        />
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={cn(
                                        "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                                        keyData.status === "active"
                                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                          : "bg-destructive/10 text-destructive border-destructive/20",
                                      )}
                                    >
                                      {keyData.status || "active"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-xs font-mono">
                                    {new Date(
                                      keyData.createdAt,
                                    ).toLocaleDateString(undefined, {
                                      dateStyle: "medium",
                                    })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleUpdateCustomLimit(
                                            keyData.id,
                                            keyData.planLimit || 1000,
                                          )
                                        }
                                        className="h-8 rounded-lg text-xs font-semibold border-white/10 hover:bg-slate-950/45 text-muted-foreground hover:text-foreground transition-all px-2.5"
                                        title="Configure Custom Quota"
                                      >
                                        Quota
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleToggleKeyStatus(
                                            keyData.id,
                                            keyData.status || "active",
                                          )
                                        }
                                        className={cn(
                                          "h-8 rounded-lg text-xs font-semibold border-white/10 hover:bg-slate-950/45 transition-all px-2.5",
                                          keyData.status === "active"
                                            ? "text-destructive hover:border-destructive/35"
                                            : "text-emerald-400 hover:border-emerald-500/35",
                                        )}
                                      >
                                        {keyData.status === "active"
                                          ? "Revoke"
                                          : "Activate"}
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={() =>
                                          handleDeleteKey(keyData.id)
                                        }
                                        className="h-8 w-8 rounded-lg shadow-sm shadow-destructive/10"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-slate-900/10">
                        <Key className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          No API Keys Found
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                          No developer API keys match the search criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Payments Verification Content */}
            <TabsContent
              value="payments"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-950/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="h-4.5 w-4.5 text-emerald-400" />{" "}
                    Payment Verification Queue
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                    {
                      paymentRequests.filter((p) => p.status === "pending")
                        .length
                    }{" "}
                    Pending
                  </Badge>
                </div>
                <div className="p-0">
                  {isLoadingPayments ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                  ) : paymentRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table className="text-sm">
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              User Email
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Current Tier
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Upgrade To
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Amount
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              UTR / Ref Number
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Submitted At
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-muted-foreground text-xs uppercase tracking-wider text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentRequests.map((payment) => (
                            <TableRow
                              key={payment.id}
                              className="border-white/5 hover:bg-slate-950/25 transition-colors"
                            >
                              <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                                {payment.email || "Unknown"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-2 py-0.5 text-xs capitalize border-white/5 bg-slate-950/50 text-muted-foreground"
                                >
                                  {payment.currentTier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                                    payment.requestedTier === "enterprise"
                                      ? "bg-primary/10 text-primary border-primary/20"
                                      : "bg-secondary/10 text-secondary border-secondary/20",
                                  )}
                                >
                                  {payment.requestedTier}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-emerald-400 font-mono">
                                ₹{payment.amount}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-foreground select-all">
                                {payment.utrNumber}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-mono">
                                {new Date(payment.createdAt).toLocaleString(
                                  undefined,
                                  { dateStyle: "medium", timeStyle: "short" },
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                                    payment.status === "approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : payment.status === "rejected"
                                        ? "bg-destructive/10 text-destructive border-destructive/20"
                                        : "bg-warning/10 text-warning border-warning/20",
                                  )}
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {payment.status === "pending" ? (
                                  <div className="flex justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleApprovePayment(payment)
                                      }
                                      className="h-8 rounded-lg text-xs font-semibold border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all px-2.5 shadow-sm"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleRejectPayment(payment)
                                      }
                                      className="h-8 rounded-lg text-xs font-semibold border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all px-2.5 shadow-sm"
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground font-mono">
                                    Reviewed
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-900/10">
                      <CreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        No Payment Requests
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                        There are no pending payment verification requests at
                        this time.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Analytics Dashboard Content */}
            <TabsContent
              value="analytics"
              className="mt-6 focus-visible:outline-none"
            >
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Submission Timeline Area Chart */}
                  <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="border-b border-white/5 pb-4 mb-6 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="h-4.5 w-4.5 text-primary" />{" "}
                        Reports Timeline
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        Report Submissions Volume
                      </span>
                    </div>
                    <div className="h-[280px] w-full text-xs font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={getTimelineData()}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorScans"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#f97316"
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="95%"
                                stopColor="#f97316"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            className="text-white/5"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="currentColor"
                            fontSize={10}
                            tickLine={false}
                            className="text-muted-foreground"
                          />
                          <YAxis
                            stroke="currentColor"
                            fontSize={10}
                            tickLine={false}
                            className="text-muted-foreground"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              borderColor: "rgba(255, 255, 255, 0.08)",
                              borderRadius: "12px",
                              fontSize: "12px",
                              color: "hsl(var(--foreground))",
                              backdropFilter: "blur(8px)",
                            }}
                            labelStyle={{
                              color: "#f97316",
                              fontWeight: "bold",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="scans"
                            stroke="#f97316"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorScans)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Risk Severity Pie Chart */}
                  <div className="glass-card border border-white/5 bg-slate-900/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="border-b border-white/5 pb-4 mb-6 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4.5 w-4.5 text-primary" />{" "}
                        Risk Severity Distribution
                      </h3>
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold px-2 py-0.5 rounded-full font-mono uppercase">
                        Database Share
                      </Badge>
                    </div>
                    <div className="h-[280px] w-full text-xs font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getRiskDistributionData()}
                            cx="50%"
                            cy="42%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {getRiskDistributionData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="rgba(15, 23, 42, 0.95)"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              borderColor: "rgba(255, 255, 255, 0.08)",
                              borderRadius: "12px",
                              fontSize: "12px",
                              color: "hsl(var(--foreground))",
                              backdropFilter: "blur(8px)",
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => (
                              <span className="text-xs text-muted-foreground pl-1">
                                {value}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Threat Node Graph Network Representation */}
                <div className="w-full">
                  <ThreatNodeGraph reports={reports} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
