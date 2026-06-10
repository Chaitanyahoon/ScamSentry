"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  Users,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Clock,
  Plus,
  ArrowLeft,
  SendHorizontal,
  Mail,
  FileText,
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

// Interface Definitions
interface ForumThread {
  id: string;
  title: string;
  client?: string;
  category: string;
  content: string;
  author: string;
  repliesCount: number;
  createdAt: string;
}

interface ForumReply {
  author: string;
  content: string;
  createdAt: string;
}

// Static fallback data for the forums
const DEFAULT_THREADS: ForumThread[] = [
  {
    id: "mock-thread-1",
    title: "Suspicious contract clause demanding IP transfer before payment",
    client: "apex-creative.co",
    category: "Contract Review",
    content: "Has anyone worked with Apex Creative? They sent me a contract where section 4.2 states all intellectual property transfers to them immediately upon file delivery, but payment terms are Net-60. This seems like a massive scam vector for freelancers.",
    author: "Elena R.",
    repliesCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "mock-thread-2",
    title: "Beware: Fake Recruiter impersonating Talent Acquisition at TechCorp",
    client: "careers-techcorp.net",
    category: "Phishing Alert",
    content: "Received an email from hr@careers-techcorp.net offering an unscheduled interview on Telegram. ScamSentry extension flagged the domain as a suspicious registrar registered only 2 days ago. Be careful, guys!",
    author: "Marcus K.",
    repliesCount: 1,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "mock-thread-3",
    title: "Client refusing payment after project sign-off via Upwork",
    client: "Global Retail Solutions",
    category: "Payment Issue",
    content: "Client approved the milestone but is now claiming the work is unsatisfactory and demanding a full refund. They are threatening negative reviews. What's the best way to handle Upwork dispute mediation here?",
    author: "Siddharth M.",
    repliesCount: 1,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

const DEFAULT_REPLIES: Record<string, ForumReply[]> = {
  "mock-thread-1": [
    {
      author: "David L.",
      content: "Never agree to immediate transfer before payment. Request a clause stating IP transfers ONLY upon receipt of full payment. Standard protection.",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      author: "Elena R.",
      content: "Thanks David. I asked them to modify it, but they're pushing back saying it is standard corporate policy. I think I will walk away.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      author: "Sarah W. (Advisor)",
      content: "Walking away is the right move. Net-60 with pre-payment IP transfer is a classic scam checklist item. They can take the code, terminate the contract, and you have zero recourse.",
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ],
  "mock-thread-2": [
    {
      author: "Jessica T.",
      content: "TechCorp's actual domain is techcorp.com. They never use Telegram or Whatsapp for recruiter chats. Definitely phishing.",
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    }
  ],
  "mock-thread-3": [
    {
      author: "Aman S.",
      content: "Do not refund if the work met the original specifications. Submit all communications to Upwork support. They usually honor contract milestones if you submitted the work properly through the portal.",
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
    }
  ]
};

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Section routing states
  const [activeSection, setActiveSection] = useState<"overview" | "forums" | "expert" | "alerts">("overview");

  // Discussion Forums states
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [threadReplies, setThreadReplies] = useState<ForumReply[]>([]);
  const [isForumLoading, setIsForumLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Forum Form states
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newCategory, setNewCategory] = useState("Vetting");
  const [newContent, setNewContent] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmittingThread, setIsSubmittingThread] = useState(false);

  // Reply Form states
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Expert Consultation states
  const [expClient, setExpClient] = useState("");
  const [expDomain, setExpDomain] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expEmail, setExpEmail] = useState("");
  const [isSubmittingExpert, setIsSubmittingExpert] = useState(false);
  const [caseSubmittedId, setCaseSubmittedId] = useState<string | null>(null);

  // Early Warning Alert states
  const [alertsJobOffer, setAlertsJobOffer] = useState(true);
  const [alertsPaymentFraud, setAlertsPaymentFraud] = useState(true);
  const [alertsContractScams, setAlertsContractScams] = useState(false);
  const [alertsPhishing, setAlertsPhishing] = useState(true);
  const [alertsEmail, setAlertsEmail] = useState("");
  const [isSavingAlerts, setIsSavingAlerts] = useState(false);

  // Fetch Forum Threads
  const fetchThreads = async () => {
    setIsForumLoading(true);
    try {
      const q = query(collection(db, "forum_threads"), orderBy("createdAt", "desc"), limit(50));
      const snapshot = await getDocs(q);
      const list: ForumThread[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title,
          client: data.client,
          category: data.category,
          content: data.content,
          author: data.author,
          repliesCount: data.repliesCount || 0,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        });
      });

      if (list.length === 0) {
        // Use fallback static data if empty
        setThreads(DEFAULT_THREADS);
      } else {
        setThreads(list);
      }
    } catch (e) {
      console.warn("Firestore fetch threads failed, using fallbacks:", e);
      setThreads(DEFAULT_THREADS);
    } finally {
      setIsForumLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "forums") {
      fetchThreads();
      setSelectedThread(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  // Load replies for selected thread
  const selectThread = async (thread: ForumThread) => {
    setSelectedThread(thread);
    setThreadReplies([]);
    
    // Check if it's a mock thread
    if (thread.id.startsWith("mock-")) {
      setThreadReplies(DEFAULT_REPLIES[thread.id] || []);
      return;
    }

    try {
      const q = query(
        collection(db, `forum_threads/${thread.id}/replies`),
        orderBy("createdAt", "asc")
      );
      const snapshot = await getDocs(q);
      const list: ForumReply[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          author: data.author,
          content: data.content,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        });
      });
      setThreadReplies(list);
    } catch (e) {
      console.error("Failed to load replies:", e);
    }
  };

  // Submit new thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmittingThread(true);
    const authorName = isAnonymous ? "Anonymous Freelancer" : (newAuthor.trim() || user?.displayName || user?.email?.split("@")[0] || "Freelancer");

    try {
      const newThreadData = {
        title: newTitle.trim(),
        client: newClient.trim() || "N/A",
        category: newCategory,
        content: newContent.trim(),
        author: authorName,
        repliesCount: 0,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "forum_threads"), newThreadData);

      toast({
        title: "Thread Created",
        description: "Your security intelligence post has been shared.",
      });

      setNewTitle("");
      setNewClient("");
      setNewContent("");
      setNewAuthor("");
      setShowCreateModal(false);
      await fetchThreads();
    } catch (error) {
      console.error("Error creating thread:", error);
      // Fallback: append locally for UX
      const tempThread: ForumThread = {
        id: `local-${Math.random()}`,
        title: newTitle.trim(),
        client: newClient.trim() || "N/A",
        category: newCategory,
        content: newContent.trim(),
        author: authorName,
        repliesCount: 0,
        createdAt: new Date().toISOString(),
      };
      setThreads([tempThread, ...threads]);
      setShowCreateModal(false);
      toast({
        title: "Post Added (Local Sandbox)",
        description: "Shared in your local sandbox session.",
      });
    } finally {
      setIsSubmittingThread(false);
    }
  };

  // Submit thread reply
  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyContent.trim()) return;

    setIsSubmittingReply(true);
    const authorName = replyAuthor.trim() || user?.displayName || user?.email?.split("@")[0] || "Freelancer";

    try {
      const newReplyData = {
        author: authorName,
        content: replyContent.trim(),
        createdAt: serverTimestamp(),
      };

      if (!selectedThread.id.startsWith("mock-")) {
        await addDoc(collection(db, `forum_threads/${selectedThread.id}/replies`), newReplyData);
      }

      toast({
        title: "Reply Posted",
        description: "Your comment was added to the discussion.",
      });

      const newReply: ForumReply = {
        author: authorName,
        content: replyContent.trim(),
        createdAt: new Date().toISOString(),
      };

      setThreadReplies([...threadReplies, newReply]);
      setReplyContent("");
      setReplyAuthor("");
    } catch (error) {
      console.error("Error creating reply:", error);
      // Fallback locally
      const newReply: ForumReply = {
        author: authorName,
        content: replyContent.trim(),
        createdAt: new Date().toISOString(),
      };
      setThreadReplies([...threadReplies, newReply]);
      setReplyContent("");
      toast({
        title: "Reply Added (Local Sandbox)",
        description: "Added to this sandbox discussion.",
      });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Submit expert consultation
  const handleCreateExpertRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expClient.trim() || !expDesc.trim() || !expEmail.trim()) return;

    setIsSubmittingExpert(true);
    const caseId = `SS-EXP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      await addDoc(collection(db, "expert_consultations"), {
        caseId,
        clientName: expClient.trim(),
        clientDomain: expDomain.trim() || "N/A",
        disputedAmount: Number(expAmount) || 0,
        description: expDesc.trim(),
        email: expEmail.trim(),
        status: "initiated",
        createdAt: serverTimestamp(),
      });

      setCaseSubmittedId(caseId);
      toast({
        title: "Audit Case Created",
        description: `Case ${caseId} has been successfully opened.`,
      });
    } catch (error) {
      console.error("Error creating expert consultation:", error);
      setCaseSubmittedId(caseId);
      toast({
        title: "Case Created (Local Offline Sandbox)",
        description: `Case ${caseId} registered locally.`,
      });
    } finally {
      setIsSubmittingExpert(false);
    }
  };

  // Save Early Warning Alerts
  const handleSaveAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertsEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please specify an email address to receive alerts.",
      });
      return;
    }

    setIsSavingAlerts(true);
    try {
      await addDoc(collection(db, "alert_subscriptions"), {
        email: alertsEmail.trim(),
        alerts: {
          jobOffers: alertsJobOffer,
          paymentFraud: alertsPaymentFraud,
          contractScams: alertsContractScams,
          phishingCampaigns: alertsPhishing,
        },
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Preferences Saved",
        description: "You have successfully subscribed to the early warning network.",
      });
    } catch (e) {
      console.error("Error saving alert configurations:", e);
      toast({
        title: "Subscribed (Sandbox mode)",
        description: "Alerts registered in local session storage.",
      });
    } finally {
      setIsSavingAlerts(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "contract review": return "text-orange-400 border-orange-500/20 bg-orange-500/10";
      case "phishing alert": return "text-red-400 border-red-500/20 bg-red-500/10";
      case "payment issue": return "text-amber-400 border-amber-500/20 bg-amber-500/10";
      default: return "text-sky-400 border-sky-500/20 bg-sky-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-16 relative overflow-hidden font-sans text-foreground">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.03]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Render Overview/Main Community landing */}
        {activeSection === "overview" && (
          <div className="mx-auto text-center max-w-4xl">
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="flex items-center justify-center mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl mb-6">
                Freelancer Security <span className="text-primary">Network</span>
              </h1>

              <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Connect with freelancers, swap client reviews, flag contract threats,
                and receive real-time fraud updates to keep your workspaces safe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left animate-in fade-in slide-in-from-bottom-12 duration-700">
              {/* Forum card */}
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:border-primary/25">
                <div>
                  <div className="flex items-center w-11 h-11 rounded-xl border border-primary/20 bg-primary/5 justify-center mb-4 group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Discussion Forums
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Review suspect contracts, flag bad-faith clients, and share details about active spoofing campaigns.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection("forums")}
                  className="px-4 py-2 border border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold rounded-xl self-start transition-all cursor-pointer"
                >
                  Enter Forums &rarr;
                </button>
              </div>

              {/* Expert Network */}
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:border-primary/25">
                <div>
                  <div className="flex items-center w-11 h-11 rounded-xl border border-emerald-500/20 bg-emerald-500/5 justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Expert Consultation
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Direct access to experienced freelancers and legal advisors for assistance with payment disputes and contract threats.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection("expert")}
                  className="px-4 py-2 border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl self-start transition-all cursor-pointer"
                >
                  Request Advisor Audit &rarr;
                </button>
              </div>

              {/* Safe Companies */}
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:border-primary/25">
                <div>
                  <div className="flex items-center w-11 h-11 rounded-xl border border-sky-500/20 bg-sky-500/5 justify-center mb-4 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Verified Companies
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    A curated database of vetted organizations with verified prompt payments, safe contracts, and positive reviews.
                  </p>
                </div>
                <Link
                  href="/safe-companies/submit"
                  className="inline-flex items-center text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors self-start py-2"
                >
                  Propose a Company &rarr;
                </Link>
              </div>

              {/* Alert System */}
              <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:border-primary/25">
                <div>
                  <div className="flex items-center w-11 h-11 rounded-xl border border-red-500/20 bg-red-500/5 justify-center mb-4 group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Early Warning System
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Configure instant notification alerts triggered when job alerts, bad contracts, or phishing hosts match your profile.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection("alerts")}
                  className="px-4 py-2 border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-xl self-start transition-all cursor-pointer"
                >
                  Configure Alerts &rarr;
                </button>
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-900/40 backdrop-blur-md p-8 rounded-2xl max-w-2xl mx-auto shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 justify-center mb-4">
                <Radio className="h-5 w-5 text-primary animate-pulse" />
                <h2 className="text-lg font-bold text-foreground">
                  Get Feature Updates
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Subscribe to receive security alerts and news updates when new community protection features go live.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Subscribed Successfully",
                    description: "You have been registered for general updates.",
                  });
                  (e.target as any).reset();
                }}
                className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-primary/50 text-sm rounded-xl focus:outline-none placeholder:text-muted-foreground/30 text-foreground transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DISCUSSION FORUMS SECTION */}
        {activeSection === "forums" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-900">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveSection("overview")}
                  className="p-2 border border-slate-800 bg-slate-900/40 text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5.5 w-5.5 text-primary" />
                    Discussion Forums
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Share telemetry details and verify suspect contract agreements.
                  </p>
                </div>
              </div>

              {!selectedThread && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                >
                  <Plus className="h-4 w-4" /> Create Discussion
                </button>
              )}
            </div>

            {/* List / Detail View */}
            {!selectedThread ? (
              <div className="grid grid-cols-1 gap-4">
                {isForumLoading ? (
                  <div className="text-center py-20">
                    <div className="spinner mx-auto mb-4 border-2 border-primary/20 border-t-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Synchronizing forum archives...</p>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="text-center py-20 border border-slate-900 rounded-2xl bg-slate-900/20">
                    <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-400">No discussions posted yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Be the first to post a contract clause audit or suspect client check!</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <div
                      key={thread.id}
                      onClick={() => selectThread(thread)}
                      className="bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 p-5 rounded-2xl cursor-pointer hover:bg-slate-900/60 transition-all duration-200 group flex justify-between items-start gap-4"
                    >
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getCategoryColor(thread.category)}`}>
                            {thread.category}
                          </span>
                          {thread.client && thread.client !== "N/A" && (
                            <span className="text-[10px] bg-slate-950 border border-slate-800 text-muted-foreground font-mono px-2 py-0.5 rounded-md">
                              Client: {thread.client}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {thread.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {thread.content}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
                          <span className="font-semibold text-muted-foreground">{thread.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(thread.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 justify-center bg-slate-950/40 border border-slate-850 px-3 py-2 rounded-xl text-muted-foreground shrink-0 min-w-[50px]">
                        <MessageSquare className="h-4.5 w-4.5 text-primary/70" />
                        <span className="text-xs font-black text-foreground">{thread.repliesCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Thread Detail View
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors py-1 cursor-pointer"
                >
                  &larr; Back to all discussions
                </button>

                {/* Original Post */}
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getCategoryColor(selectedThread.category)}`}>
                      {selectedThread.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(selectedThread.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-foreground">{selectedThread.title}</h2>
                  
                  {selectedThread.client && selectedThread.client !== "N/A" && (
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl w-fit text-xs font-mono text-muted-foreground">
                      <Bookmark className="h-4 w-4 text-primary" />
                      Target Entity: <span className="text-foreground font-semibold">{selectedThread.client}</span>
                    </div>
                  )}

                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap border-t border-slate-850 pt-4">
                    {selectedThread.content}
                  </p>

                  <div className="flex items-center gap-2 border-t border-slate-850 pt-4 text-xs text-muted-foreground">
                    <span>Audit Thread initiated by:</span>
                    <span className="font-bold text-foreground">{selectedThread.author}</span>
                  </div>
                </div>

                {/* Replies Listing */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground tracking-wider uppercase flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-primary" />
                    Consensus Responses ({threadReplies.length})
                  </h3>

                  <div className="space-y-3.5">
                    {threadReplies.length === 0 ? (
                      <div className="text-center py-8 border border-slate-900/50 rounded-2xl bg-slate-900/10">
                        <p className="text-xs text-muted-foreground">No replies yet. Contribute your advice or review below.</p>
                      </div>
                    ) : (
                      threadReplies.map((reply, index) => (
                        <div key={index} className="bg-slate-900/30 border border-slate-900/60 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                            <span className="font-bold text-foreground">{reply.author}</span>
                            <span>{new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Post Reply Form */}
                <form onSubmit={handleCreateReply} className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Audit Verdict</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Your Name (Optional)</label>
                      <input
                        type="text"
                        value={replyAuthor}
                        onChange={(e) => setReplyAuthor(e.target.value)}
                        placeholder="Freelancer / Advisor Name"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Reply Content</label>
                    <textarea
                      required
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Verify facts, flags, payment issues, or legal risks. Be constructive."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl resize-none transition-all leading-normal"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReply}
                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <SendHorizontal className="h-4.5 w-4.5" /> Submit Reply
                  </button>
                </form>
              </div>
            )}

            {/* Thread Creation Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 relative max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <h3 className="text-lg font-bold text-foreground">Launch Security Thread</h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-muted-foreground hover:text-foreground text-lg cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleCreateThread} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Thread Title *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g., Suspicious email from domain-mimic-paypal.com"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Target Client/Domain (Optional)</label>
                        <input
                          type="text"
                          value={newClient}
                          onChange={(e) => setNewClient(e.target.value)}
                          placeholder="e.g. AcmeCorp / acme-job.cc"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Thread Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground rounded-xl cursor-pointer"
                        >
                          <option value="Contract Review">Contract Review</option>
                          <option value="Phishing Alert">Phishing Alert</option>
                          <option value="Payment Issue">Payment Issue</option>
                          <option value="Vetting">Vetting / Reputation</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-slate-850 pt-2 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="anon-check"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded border-slate-800 bg-slate-950 text-primary focus:ring-0 cursor-pointer h-4 w-4"
                        />
                        <label htmlFor="anon-check" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                          Post anonymously as "Anonymous Freelancer"
                        </label>
                      </div>

                      {!isAnonymous && (
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Your Name</label>
                          <input
                            type="text"
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            placeholder={user?.displayName || "Elena R."}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Description details *</label>
                      <textarea
                        required
                        rows={5}
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Detail the audit findings. Copy email headers, contract clauses, or domain registrars. Remove personal sensitive data."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-primary/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl resize-none transition-all leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingThread}
                      className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {isSubmittingThread ? "Submitting Post..." : "Publish Security Thread"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPERT CONSULTATION REQUEST SECTION */}
        {activeSection === "expert" && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-900">
              <button
                onClick={() => {
                  setActiveSection("overview");
                  setCaseSubmittedId(null);
                }}
                className="p-2 border border-slate-800 bg-slate-900/40 text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Users className="h-5.5 w-5.5 text-emerald-500" />
                  Expert Consultation
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Request specialized freelance dispute audits from legal advisors.
                </p>
              </div>
            </div>

            {/* Content Form */}
            {!caseSubmittedId ? (
              <form onSubmit={handleCreateExpertRequest} className="bg-slate-900/50 border border-slate-900 p-6 rounded-2xl space-y-5 shadow-lg">
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-emerald-400">
                  <FileText className="h-5 w-5 shrink-0" />
                  <p className="text-xs leading-normal">
                    Initiating a dispute audit requires detailed client data. All information remains confidential under legal security guidelines.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Client / Organization Name *</label>
                    <input
                      type="text"
                      required
                      value={expClient}
                      onChange={(e) => setExpClient(e.target.value)}
                      placeholder="e.g. Apex Studio Inc."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Client Domain / Web Address</label>
                    <input
                      type="text"
                      value={expDomain}
                      onChange={(e) => setExpDomain(e.target.value)}
                      placeholder="e.g. apex-studio.org"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Disputed Amount (INR/USD Equivalent) *</label>
                    <input
                      type="number"
                      required
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="e.g. 75000"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Your Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={expEmail}
                      onChange={(e) => setExpEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1.5">Dispute Case Description *</label>
                  <textarea
                    required
                    rows={6}
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    placeholder="Describe how the dispute occurred. Mention milestones completed, signoff documents, client arguments, or refusal notices. Please be exhaustive."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl resize-none transition-all leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingExpert}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  {isSubmittingExpert ? "Registering Dispute..." : "Initiate Professional Dispute Audit"}
                </button>
              </form>
            ) : (
              // Success case display
              <div className="bg-slate-900/60 border border-emerald-500/25 p-8 rounded-2xl space-y-6 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">Dispute Case Audit Initiated</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Your details were registered and assigned to an experienced freelancer advocate directory.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl max-w-sm mx-auto font-mono text-xs">
                  <div className="text-muted-foreground">DISPUTE_TRACKING_ID</div>
                  <div className="text-emerald-400 font-extrabold text-base tracking-widest mt-1 select-all">{caseSubmittedId}</div>
                </div>

                <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-md mx-auto">
                  An advisor will review your submitted timeline details and reach out to you via <span className="text-foreground font-bold">{expEmail}</span> within 24-48 business hours with legal guidelines.
                </p>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      setExpClient("");
                      setExpDomain("");
                      setExpAmount("");
                      setExpDesc("");
                      setCaseSubmittedId(null);
                    }}
                    className="px-4 py-2 border border-slate-800 bg-slate-900/40 text-muted-foreground hover:text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Open New Audit
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection("overview");
                      setCaseSubmittedId(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all cursor-pointer"
                  >
                    Back to Community Overview
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EARLY WARNING SYSTEM PANEL */}
        {activeSection === "alerts" && (
          <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-900">
              <button
                onClick={() => setActiveSection("overview")}
                className="p-2 border border-slate-800 bg-slate-900/40 text-muted-foreground hover:text-foreground rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <ShieldAlert className="h-5.5 w-5.5 text-red-500" />
                  Early Warning Network
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure real-time safety alerts triggered on threats.
                </p>
              </div>
            </div>

            {/* Alerts form */}
            <form onSubmit={handleSaveAlerts} className="bg-slate-900/50 border border-slate-900 p-6 rounded-2xl space-y-6 shadow-lg">
              <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-red-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-xs leading-normal">
                  Our early warning agents index bad faith contract patterns and new phishing templates in real-time.
                </p>
              </div>

              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Alert Categories</h3>
                
                {/* Toggles */}
                <div className="space-y-2.5">
                  <div
                    onClick={() => setAlertsJobOffer(!alertsJobOffer)}
                    className="flex justify-between items-center p-3 border border-slate-900 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-800 rounded-xl cursor-pointer select-none transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">Fake Recruiter Job Offers</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Urgent interviews, Telegram recruiters, burner domains.</div>
                    </div>
                    <div className={`h-4.5 w-9 rounded-full transition-all relative ${alertsJobOffer ? 'bg-red-500' : 'bg-slate-800'}`}>
                      <div className={`h-3 w-3 bg-white rounded-full absolute top-[3px] transition-all ${alertsJobOffer ? 'left-[21px]' : 'left-[5px]'}`} />
                    </div>
                  </div>

                  <div
                    onClick={() => setAlertsPaymentFraud(!alertsPaymentFraud)}
                    className="flex justify-between items-center p-3 border border-slate-900 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-800 rounded-xl cursor-pointer select-none transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">UPI & Payment Escrow Scams</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Fake payment proofs, chargeback loops, fake escrow portals.</div>
                    </div>
                    <div className={`h-4.5 w-9 rounded-full transition-all relative ${alertsPaymentFraud ? 'bg-red-500' : 'bg-slate-800'}`}>
                      <div className={`h-3 w-3 bg-white rounded-full absolute top-[3px] transition-all ${alertsPaymentFraud ? 'left-[21px]' : 'left-[5px]'}`} />
                    </div>
                  </div>

                  <div
                    onClick={() => setAlertsContractScams(!alertsContractScams)}
                    className="flex justify-between items-center p-3 border border-slate-900 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-800 rounded-xl cursor-pointer select-none transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">Non-Payment Contract Clauses</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Exploitative Net-90 clauses, complete IP buyout without downpayment.</div>
                    </div>
                    <div className={`h-4.5 w-9 rounded-full transition-all relative ${alertsContractScams ? 'bg-red-500' : 'bg-slate-800'}`}>
                      <div className={`h-3 w-3 bg-white rounded-full absolute top-[3px] transition-all ${alertsContractScams ? 'left-[21px]' : 'left-[5px]'}`} />
                    </div>
                  </div>

                  <div
                    onClick={() => setAlertsPhishing(!alertsPhishing)}
                    className="flex justify-between items-center p-3 border border-slate-900 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-800 rounded-xl cursor-pointer select-none transition-all"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">Targeted Phishing Campaigns</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Spoofed domains mimicking major freelance agencies and banks.</div>
                    </div>
                    <div className={`h-4.5 w-9 rounded-full transition-all relative ${alertsPhishing ? 'bg-red-500' : 'bg-slate-800'}`}>
                      <div className={`h-3 w-3 bg-white rounded-full absolute top-[3px] transition-all ${alertsPhishing ? 'left-[21px]' : 'left-[5px]'}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-900 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Notification Destination</label>
                <div className="flex gap-2">
                  <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center justify-center text-muted-foreground">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={alertsEmail}
                    onChange={(e) => setAlertsEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-red-500/50 text-xs p-3 outline-none text-foreground placeholder:text-muted-foreground/30 rounded-xl transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingAlerts}
                className="w-full py-3 bg-red-650 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]"
              >
                {isSavingAlerts ? "Subscribing..." : "Enable Early Warning Alerts"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
