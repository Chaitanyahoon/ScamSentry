"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  AlertTriangle, MapPin, Building, Tag, FileText, Send, Loader2,
  Briefcase, DollarSign, UserX, Lock, ShieldAlert, HelpCircle,
  ChevronRight, ChevronLeft, Upload, X, ImageIcon, Terminal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { geocodeCity } from "@/utils/geocoding"
import { useReports } from "@/contexts/reports-context"
import { cn } from "@/lib/utils"

const scamTypes = [
  { id: "Fake Job Offer", label: "FAKE_JOB_OFFER", icon: Briefcase, description: "Unverified job pipelines demanding immediate payment." },
  { id: "Unpaid Work", label: "UNPAID_WORK", icon: DollarSign, description: "Completed modules remaining uncompensated by client nodes." },
  { id: "Portfolio Theft", label: "PORTFOLIO_THEFT", icon: UserX, description: "Unauthorized cloning of intellectual property or assets." },
  { id: "Upfront Payment Scam", label: "UPFRONT_PAYMENT", icon: Lock, description: "Advance fee extraction protocols masked as 'security' deposits." },
  { id: "Identity Theft", label: "IDENTITY_THEFT", icon: ShieldAlert, description: "Malicious attempts to exfiltrate personal data structures." },
  { id: "Other", label: "OTHER_ANOMALY", icon: HelpCircle, description: "Undefined fraudulent architectural behaviors." },
]

const industries = [
  "Web Development", "Graphic Design", "Content Writing", "Digital Marketing",
  "Data Entry", "Virtual Assistant", "Photography", "Video Editing", "Translation", "Other"
]

const commonTags = [
  "upfront-payment", "fake-training", "no-contract", "suspicious-email",
  "too-good-to-be-true", "poor-communication", "pressure-tactics",
  "fake-website", "stolen-identity", "unrealistic-timeline"
]

export default function ReportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { addReport, uploadEvidence } = useReports()

  const [step, setStep] = useState(1)
  const totalSteps = 3
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    scamType: "",
    industry: "",
    location: "",
    description: "",
    anonymous: true,
    email: "",
  })

  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false)
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null)
  const [userCaptchaInput, setUserCaptchaInput] = useState("")

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setCaptchaAnswer(num1 + num2)
    setUserCaptchaInput("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      if (evidenceFiles.length + newFiles.length > 5) {
        toast({ title: "SYS_ERR: OVERLOAD", description: "Maximum of 5 data blocks allowed.", variant: "destructive" })
        return
      }
      const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast({ title: "SYS_ERR: FILE_TOO_LARGE", description: "Blocks must not exceed 5MB.", variant: "destructive" })
        return
      }
      setEvidenceFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.scamType) {
        toast({ title: "SYS_ERR: MISSING_PARAM", description: "Select anomaly type vector.", variant: "destructive" })
        return
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.description) {
        toast({ title: "SYS_ERR: INCOMPLETE_DATA", description: "Title and description required.", variant: "destructive" })
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, totalSteps))
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    if (Number.parseInt(userCaptchaInput) !== captchaAnswer) {
      toast({ title: "SYS_ERR: AUTH_FAILURE", description: "Incorrect CAPTCHA parameters.", variant: "destructive" })
      generateCaptcha()
      return
    }

    setIsSubmitting(true)
    try {
      let evidenceUrls: string[] = []
      if (evidenceFiles.length > 0) {
        setIsUploadingEvidence(true)
        try {
          const uploadPromises = evidenceFiles.map(file => uploadEvidence(file))
          evidenceUrls = await Promise.all(uploadPromises)
          toast({ title: "DATA_UPLOADED", description: "Evidence chunks processed." })
        } catch (uploadError) {
          toast({ title: "UPLOAD_FAILURE", description: "Some blocks failed transfer. Committing available data.", variant: "destructive" })
        } finally {
          setIsUploadingEvidence(false)
        }
      }

      let locationData = { city: "", state: "", country: "", lat: undefined as number | undefined, lng: undefined as number | undefined }

      if (formData.location.trim()) {
        const geoResult = await geocodeCity(formData.location)
        if (geoResult) {
          locationData = {
            city: geoResult.city,
            state: geoResult.state,
            country: geoResult.country,
            lat: geoResult.lat,
            lng: geoResult.lng,
          }
        }
      }

      const highRiskTypes = ["Fake Job Offer", "Upfront Payment Scam", "Identity Theft"]
      const isHighRisk = highRiskTypes.includes(formData.scamType)
      const riskLevel = isHighRisk ? "high" : formData.scamType === "Other" ? "low" : "medium"

      const newReport = await addReport({
        title: formData.title,
        company: formData.company || "Unknown Node",
        scamType: formData.scamType,
        industry: formData.industry || "Other",
        location: formData.location || "GLOBAL_NETWORK",
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
      })

      if (newReport) {
        toast({ title: "COMMIT_SUCCESS", description: "Malicious node recorded into database." })
        router.push(`/report/success/${newReport.id}`)
      } else {
        throw new Error("Commit aborted")
      }
    } catch (error: any) {
      toast({
        title: "SYS_ERR: KERNEL_PANIC",
        description: "Transmission failed. Contact system administrator.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Dynamic Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]"></div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 inline-flex p-4 border border-destructive/50 bg-destructive/10 text-destructive shadow-[0_0_15px_hsla(var(--destructive),0.3)]">
            <AlertTriangle className="h-8 w-8 drop-shadow-[0_0_8px_hsla(var(--destructive),1)] animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-widest text-foreground uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
            DUMP NEW <span className="text-destructive drop-shadow-[0_0_8px_hsla(var(--destructive),0.5)]">THREAT</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground font-mono uppercase tracking-widest">
            INITIALIZE REPORT SEQUENCE :: STAGE {step}/{totalSteps}
          </p>
          <div className="h-1 mt-6 w-full max-w-lg mx-auto bg-card border border-border">
            <div className="h-full bg-destructive transition-all duration-300 shadow-[0_0_5px_hsla(var(--destructive),0.8)]" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        <div className="glass-strong">
          <div className="bg-card/80 border-b border-border p-4 flex gap-5">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase">
              <Terminal className="h-4 w-4 text-destructive" /> DATA_ENTRY_FORM
            </div>
          </div>
          <div className="p-6 sm:p-10 bg-background/50">

            {/* STEP 1: SCAM TYPE */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-widest font-mono text-foreground">IDENTIFY ANOMALY VECTOR</h2>
                  <p className="text-sm font-mono text-muted-foreground tracking-widest mt-2 uppercase">SELECT THE PROTOCOL_BREACH THAT MATCHES THE EVENT.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {scamTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.scamType === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData(prev => ({ ...prev, scamType: type.id }))}
                        className={cn(
                          "cursor-pointer border-2 p-5 transition-all bg-card/50",
                          isSelected ? "border-primary bg-primary/10 shadow-[0_0_15px_hsla(var(--primary),0.2)]" : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={cn("p-2 border", isSelected ? "bg-primary text-white border-primary drop-shadow-[0_0_5px_currentColor]" : "bg-background text-muted-foreground border-border")}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground font-mono uppercase tracking-widest">{type.label}</h3>
                            <p className="text-xs text-muted-foreground mt-2 font-mono tracking-wide leading-relaxed">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 font-mono">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-widest font-mono text-foreground">PROVIDE PAYLOAD LOGS</h2>
                  <p className="text-sm font-mono text-muted-foreground tracking-widest mt-2 uppercase">INPUT EXPLICIT DATA SO WE CAN FLAG THE OFFENDING NODES.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-primary font-bold tracking-widest mb-2 block uppercase text-xs">REPORT_TITLE *</Label>
                    <Input
                      id="title"
                      placeholder="E.G: FAKE SYSTEM_ADMIN RECRUITMENT"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-12 bg-card/50 border-border text-foreground tracking-widest rounded-none focus-visible:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company" className="text-muted-foreground font-bold tracking-widest mb-2 block uppercase text-xs">RESPONSIBLE_NODE (COMPANY)</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                        <Input
                          id="company"
                          className="pl-10 h-12 bg-card/50 border-border text-foreground tracking-widest rounded-none focus-visible:border-primary uppercase"
                          placeholder="COMPANY OR USERNAME"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="industry" className="text-muted-foreground font-bold tracking-widest mb-2 block uppercase text-xs">AFFECTED_INDUSTRY</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(val: string) => setFormData({ ...formData, industry: val })}
                      >
                        <SelectTrigger className="h-12 bg-card/50 border-border text-foreground tracking-widest rounded-none uppercase focus:ring-primary focus:ring-offset-0">
                          <SelectValue placeholder="SELECT_SECTOR" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded-none text-foreground font-mono uppercase tracking-widest">
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind.toUpperCase().replace(/\s+/g, '_')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-muted-foreground font-bold tracking-widest mb-2 block uppercase text-xs">IP_GEO_LOCATION (OPTIONAL)</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                      <Input
                        id="location"
                        className="pl-10 h-12 bg-card/50 border-border text-foreground tracking-widest rounded-none focus-visible:border-primary uppercase"
                        placeholder="CITY OR REGION"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-primary font-bold tracking-widest mb-2 block uppercase text-xs">EVENT_LOG_DESCRIPTION *</Label>
                    <Textarea
                      id="description"
                      rows={8}
                      className="mt-1 bg-card/50 border-border text-foreground tracking-widest rounded-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary resize-none uppercase"
                      placeholder="DUMP RAW TEXT DETAILING THE OPERATION PROTOCOLS OF THE SCAMMER..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 font-mono">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-widest font-mono text-foreground">APPEND METADATA & COMPILE</h2>
                  <p className="text-sm font-mono text-muted-foreground tracking-widest mt-2 uppercase">ATTACH PROOF_OF_WORK AND DEFINE PRIVACY SETTINGS.</p>
                </div>

                <div>
                  <Label className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary">SELECT_TAGS (MULTIPLE)</Label>
                  <div className="flex flex-wrap gap-3">
                    {commonTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className={cn("cursor-pointer py-2 px-3 rounded-none tracking-widest uppercase transition-all", 
                          selectedTags.includes(tag) ? "border-primary bg-primary/20 text-primary shadow-[0_0_5px_hsla(var(--primary),0.5)]" : "border-border bg-card/50 text-muted-foreground hover:border-primary/50"
                        )}
                        onClick={() => toggleTag(tag)}
                      >
                        #{tag.replace(/-/g, '_')}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Evidence Upload */}
                <div>
                  <Label className="mb-4 block text-xs font-bold uppercase tracking-widest text-primary">ATTACH_EVIDENCE_FILES (OPTIONAL)</Label>
                  <div className="space-y-4">
                    <div className="border border-dashed border-primary/50 bg-primary/5 p-8 text-center hover:bg-primary/10 transition-colors">
                      <input
                        type="file"
                        id="evidence-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer block">
                        <Upload className="h-10 w-10 mx-auto text-primary drop-shadow-[0_0_5px_currentColor] mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-foreground">
                          CLICK_TO_UPLOAD_ASSETS
                        </p>
                        <p className="text-xs text-secondary mt-2 uppercase tracking-wide">
                          PNG, JPG, PDF &lt; 5MB EACH (MAX 5 BLOCKS)
                        </p>
                      </label>
                    </div>

                    {/* File Preview */}
                    {evidenceFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative group bg-card border border-border p-3 flex"
                          >
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-3 -right-3 bg-destructive text-white border border-destructive drop-shadow-[0_0_5px_hsla(var(--destructive),0.5)] p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="flex flex-col flex-1 truncate">
                              <div className="flex items-center space-x-2 mb-1">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <p className="text-xs font-bold text-foreground truncate uppercase">
                                  {file.name}
                                </p>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 uppercase">
                                {(file.size / 1024).toFixed(1)} KB_DATA
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card/50 border border-border p-6 space-y-6">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id="anonymous"
                      checked={formData.anonymous}
                      onCheckedChange={(c: boolean) => setFormData({ ...formData, anonymous: !!c })}
                      className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-black rounded-none h-6 w-6"
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer text-sm font-bold uppercase tracking-widest text-foreground">ENCRYPT_USER_IDENTITY (ANONYMOUS_POSTING)</Label>
                  </div>

                  {!formData.anonymous && (
                    <div className="pt-4 border-t border-border">
                      <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">CONTACT_ADDRESS (OPTIONAL)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="RECEIVE STATUS UPDATES"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-background border-border text-foreground tracking-widest rounded-none focus-visible:border-primary uppercase"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-card/50 border border-warning/50 p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-xs font-bold uppercase tracking-widest text-warning mb-2 block">HUMAN_VERIFICATION_REQUIRED: {captchaQuestion}</Label>
                    <Input
                      type="number"
                      placeholder="ENTER SUM"
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value)}
                      className="h-12 bg-background border-warning text-foreground tracking-widest rounded-none focus-visible:border-warning font-black"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between pt-8 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className={cn(
                  "h-12 border-border text-muted-foreground hover:bg-card hover:text-foreground rounded-none tracking-widest uppercase font-bold",
                  step === 1 ? "invisible" : ""
                )}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> REVERT
              </Button>

              {step < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  className="cyber-button h-12 px-8 rounded-none tracking-widest uppercase font-bold"
                >
                  NEXT_PHASE <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="h-12 px-8 rounded-none tracking-widest uppercase font-bold border-destructive bg-destructive/20 text-destructive hover:bg-destructive hover:text-black border shadow-[0_0_10px_hsla(var(--destructive),0.5)] transition-all flex items-center"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> COMPILING...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> EXECUTE_COMMIT</>
                  )}
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
