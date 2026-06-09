"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  MapPin,
  Building,
  Tag,
  FileText,
  Send,
  Loader2,
  Briefcase,
  DollarSign,
  UserX,
  Lock,
  ShieldAlert,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  TerminalSquare,
  Server,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { geocodeCity } from "@/utils/geocoding";
import { useReports } from "@/contexts/reports-context";
import { cn } from "@/lib/utils";

const scamTypes = [
  {
    id: "Fake Job Offer",
    label: "Fake Job Offer",
    icon: Briefcase,
    description: "Unverified job pipelines demanding immediate payment.",
  },
  {
    id: "Unpaid Work",
    label: "Unpaid Work",
    icon: DollarSign,
    description: "Completed modules remaining uncompensated by client nodes.",
  },
  {
    id: "Portfolio Theft",
    label: "Portfolio Theft",
    icon: UserX,
    description: "Unauthorized cloning of intellectual property or assets.",
  },
  {
    id: "Upfront Payment Scam",
    label: "Upfront Payment",
    icon: Lock,
    description:
      "Advance fee extraction protocols masked as 'security' deposits.",
  },
  {
    id: "Identity Theft",
    label: "Identity Theft",
    icon: ShieldAlert,
    description: "Malicious attempts to exfiltrate personal data structures.",
  },
  {
    id: "Other",
    label: "Other",
    icon: HelpCircle,
    description: "Undefined fraudulent architectural behaviors.",
  },
];

const industries = [
  "Web Development",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Entry",
  "Virtual Assistant",
  "Photography",
  "Video Editing",
  "Translation",
  "Other",
];

const commonTags = [
  "upfront-payment",
  "fake-training",
  "no-contract",
  "suspicious-email",
  "too-good-to-be-true",
  "poor-communication",
  "pressure-tactics",
  "fake-website",
  "stolen-identity",
  "unrealistic-timeline",
];

export default function ReportPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { addReport, uploadEvidence } = useReports();

  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    scamType: "",
    industry: "",
    location: "",
    description: "",
    anonymous: true,
    email: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);
  const [userCaptchaInput, setUserCaptchaInput] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
    setCaptchaAnswer(num1 + num2);
    setUserCaptchaInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      if (evidenceFiles.length + newFiles.length > 5) {
        toast({
          title: "LIMIT EXCEEDED",
          description: "Maximum of 5 files allowed.",
          variant: "destructive",
        });
        return;
      }
      const oversizedFiles = newFiles.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast({
          title: "FILE TOO LARGE",
          description: "Files must not exceed 5MB.",
          variant: "destructive",
        });
        return;
      }
      setEvidenceFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.scamType) {
        toast({
          title: "MISSING INFO",
          description: "Please select a scam vector classification.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.description) {
        toast({
          title: "INCOMPLETE DOSSIER",
          description: "Dossier title and description parameters are required.",
          variant: "destructive",
        });
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (Number.parseInt(userCaptchaInput) !== captchaAnswer) {
      toast({
        title: "VERIFICATION FAILED",
        description: "Incorrect CAPTCHA response.",
        variant: "destructive",
      });
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      let evidenceUrls: string[] = [];
      if (evidenceFiles.length > 0) {
        setIsUploadingEvidence(true);
        try {
          const uploadPromises = evidenceFiles.map((file) =>
            uploadEvidence(file),
          );
          evidenceUrls = await Promise.all(uploadPromises);
          toast({
            title: "UPLOADS SECURED",
            description: "Evidence payloads stored.",
          });
        } catch (uploadError) {
          toast({
            title: "UPLOAD ERROR",
            description: "Some file packets failed to transmit.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingEvidence(false);
        }
      }

      let locationData = {
        city: "",
        state: "",
        country: "",
        lat: undefined as number | undefined,
        lng: undefined as number | undefined,
      };

      if (formData.location.trim()) {
        const geoResult = await geocodeCity(formData.location);
        if (geoResult) {
          locationData = {
            city: geoResult.city,
            state: geoResult.state,
            country: geoResult.country,
            lat: geoResult.lat,
            lng: geoResult.lng,
          };
        }
      }

      const highRiskTypes = [
        "Fake Job Offer",
        "Upfront Payment Scam",
        "Identity Theft",
      ];
      const isHighRisk = highRiskTypes.includes(formData.scamType);
      const riskLevel = isHighRisk
        ? "high"
        : formData.scamType === "Other"
          ? "low"
          : "medium";

      const newReport = await addReport({
        title: formData.title,
        company: formData.company || "Unknown Company",
        scamType: formData.scamType,
        industry: formData.industry || "Other",
        location: formData.location || "Global/Online",
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
        lat: locationData.lat,
        lng: locationData.lng,
        description: formData.description,
        tags: selectedTags,
        anonymous: formData.anonymous,
        email: formData.anonymous ? undefined : formData.email,
        riskLevel,
        evidenceUrls,
      });

      if (newReport) {
        toast({
          title: "DOSSIER SUBMITTED",
          description:
            "Your report has been logged and queued for consensus review.",
        });
        router.push(`/report/success/${newReport.id}`);
      } else {
        throw new Error("Submission aborted");
      }
    } catch (error: any) {
      toast({
        title: "SUBMISSION FAILED",
        description:
          "An error occurred while logging telemetry. Please re-run.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="min-h-screen bg-background py-10 relative font-sans text-foreground">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.03]" />

      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive rounded-full">
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
            Secure Report Channel
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Report a Scam Link
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Help protect the community. Log the details of job scams, phishing
            websites, or other fraudulent links.
          </p>

          {/* Progress Stepper */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span className={step >= 1 ? "text-primary font-bold" : ""}>
              1. Category
            </span>
            <div className="flex-1 h-px bg-border mx-4 relative" />
            <span className={step >= 2 ? "text-primary font-bold" : ""}>
              2. Details
            </span>
            <div className="flex-1 h-px bg-border mx-4 relative" />
            <span className={step >= 3 ? "text-primary font-bold" : ""}>
              3. Submit
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-card/50 backdrop-blur-sm border border-border shadow-xl rounded-2xl overflow-hidden relative">
          {/* Form Header */}
          <div className="border-b border-border py-2.5 px-4 bg-card/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <TerminalSquare className="h-4 w-4 text-primary" />
              New Report Entry
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure Session
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {/* STEP 1: SCAM TYPE */}
            {step === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2 border-b border-border pb-2">
                  <h2 className="text-base font-bold text-foreground tracking-tight">
                    Step 1: Select Scam Category
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select the type of fraud classification that best describes
                    the scam.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-muted/10 border border-border p-3 rounded-xl">
                  {scamTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.scamType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            scamType: type.id,
                          }))
                        }
                        className={cn(
                          "cursor-pointer border p-3 transition-all rounded-xl relative select-none",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card/40 hover:border-primary/40 hover:bg-muted/20",
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={cn(
                              "p-1.5 rounded-lg border transition-colors",
                              isSelected
                                ? "text-primary border-primary bg-primary/10"
                                : "text-muted-foreground border-border bg-background",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
                              {type.label}
                            </h3>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 mt-1 leading-relaxed">
                          {type.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2 border-b border-border pb-2">
                  <h2 className="text-base font-bold text-foreground tracking-tight">
                    Step 2: Incident Details
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Provide details about the scam to help identify and record
                    this incident.
                  </p>
                </div>

                <div className="space-y-3 bg-muted/10 border border-border p-3 rounded-xl">
                  <div>
                    <Label
                      htmlFor="title"
                      className="text-xs font-semibold text-foreground mb-1.5 block"
                    >
                      Report Title *
                    </Label>
                    <div className="relative">
                      <Input
                        id="title"
                        placeholder="E.g., Fake Job Offer impersonating XYZ Corp"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="h-10 bg-background/50 border-border text-foreground text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="company"
                        className="text-xs font-semibold text-foreground mb-1.5 block"
                      >
                        Company / Entity Name
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/45" />
                        <Input
                          id="company"
                          className="pl-10 h-10 bg-background/50 border-border text-foreground text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                          placeholder="E.g., Tech Solutions Inc."
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              company: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="industry"
                        className="text-xs font-semibold text-foreground mb-1.5 block"
                      >
                        Industry Classification
                      </Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(val: string) =>
                          setFormData({ ...formData, industry: val })
                        }
                      >
                        <SelectTrigger className="h-10 bg-background/50 border-border text-foreground text-sm rounded-xl focus:ring-primary focus:border-primary">
                          <SelectValue placeholder="Select Industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground rounded-xl">
                          {industries.map((ind) => (
                            <SelectItem
                              key={ind}
                              value={ind}
                              className="text-xs rounded-lg focus:bg-primary/20 focus:text-primary"
                            >
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="location"
                      className="text-xs font-semibold text-foreground mb-1.5 block"
                    >
                      Location (Optional)
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/45" />
                      <Input
                        id="location"
                        className="pl-10 h-10 bg-background/50 border-border text-foreground text-sm rounded-xl focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                        placeholder="City, Country, or 'Online'"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-xs font-semibold text-foreground mb-1.5 block"
                    >
                      Scam Description *
                    </Label>
                    <Textarea
                      id="description"
                      rows={4}
                      className="bg-background/50 border-border text-foreground text-sm rounded-xl resize-none focus-visible:ring-primary focus-visible:border-primary leading-relaxed placeholder:text-muted-foreground/35"
                      placeholder="Describe how the scam worked, the communications you received, domains mimicked, or payment requested..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {step === 3 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-2 border-b border-border pb-2">
                  <h2 className="text-base font-bold text-foreground tracking-tight">
                    Step 3: Verification & Submission
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Attach supporting files and complete the safety check to
                    submit the report.
                  </p>
                </div>

                <div className="bg-muted/10 border border-border p-3 rounded-xl space-y-3">
                  <div>
                    <Label className="mb-2 block text-xs font-semibold text-foreground">
                      Related Scam Tags
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {commonTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            "cursor-pointer py-1 px-2 rounded-full transition-all text-xs font-medium",
                            selectedTags.includes(tag)
                              ? "bg-primary border-primary text-primary-foreground shadow-sm"
                              : "bg-card hover:bg-muted text-muted-foreground border-border",
                          )}
                          onClick={() => toggleTag(tag)}
                        >
                          #{tag.replace(/-/g, "_").toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <Label className="mb-2 block text-xs font-semibold text-foreground">
                      Attach Supporting Evidence (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-border bg-card/25 p-3.5 text-center hover:bg-muted/20 transition-all cursor-pointer rounded-xl group relative">
                      <input
                        type="file"
                        id="evidence-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="evidence-upload"
                        className="cursor-pointer block w-full h-full"
                      >
                        <Upload className="h-6 w-6 mx-auto text-primary/70 mb-2 group-hover:scale-105 transition-transform" />
                        <span className="text-xs font-semibold text-foreground block">
                          Drag or Click to Upload screenshots or PDF files
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 block">
                          Limit 5 files. Max size 5MB each.
                        </span>
                      </label>
                    </div>

                    {/* File Preview */}
                    {evidenceFiles.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative bg-card/60 border border-border p-2.5 rounded-xl flex items-center justify-between"
                          >
                            <div className="flex flex-col flex-1 truncate text-xs pr-4">
                              <p className="font-semibold text-foreground truncate">
                                {file.name}
                              </p>
                              <p className="text-muted-foreground/60 mt-0.5">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-muted-foreground hover:text-destructive border border-border bg-background p-1 rounded-lg hover:bg-destructive/10 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="anonymous"
                        checked={formData.anonymous}
                        onCheckedChange={(c: boolean) =>
                          setFormData({ ...formData, anonymous: !!c })
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-5 w-5 rounded-md"
                      />
                      <Label
                        htmlFor="anonymous"
                        className="cursor-pointer text-sm font-medium text-foreground"
                      >
                        Submit anonymously (Encrypt my contact details)
                      </Label>
                    </div>

                    {!formData.anonymous && (
                      <div className="pl-8 animate-in fade-in duration-200">
                        <Label
                          htmlFor="email"
                          className="text-xs font-semibold text-foreground mb-1.5 block"
                        >
                          Contact Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="h-10 bg-background/50 border-border text-foreground text-sm rounded-xl max-w-sm focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                        />
                      </div>
                    )}
                  </div>

                  {/* CAPTCHA validation */}
                  <div className="bg-card/40 border border-border p-3 rounded-xl">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-primary">
                        Safety Verification
                      </Label>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono bg-background border border-border px-3.5 py-2.5 rounded-xl min-w-[90px] text-center select-none text-primary">
                          {captchaQuestion}
                        </span>
                        <Input
                          type="number"
                          placeholder="Answer"
                          value={userCaptchaInput}
                          onChange={(e) => setUserCaptchaInput(e.target.value)}
                          className="h-10 bg-background/50 border-border text-foreground text-sm rounded-xl max-w-[100px] focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/35"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons Deck */}
            <div className="mt-4 flex justify-between pt-3 border-t border-border">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="h-10 px-5 text-xs font-semibold rounded-xl border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <ChevronLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="h-10 px-6 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all"
                >
                  Next <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isUploadingEvidence}
                  className="h-10 px-6 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/15 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{" "}
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Submit Report
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
