"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  AlertTriangle, MapPin, Building, Tag, FileText, Send, Loader2,
  Briefcase, DollarSign, UserX, Lock, ShieldAlert, HelpCircle,
  ChevronRight, ChevronLeft, Upload, X, TerminalSquare, Server, Globe2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { geocodeCity } from "@/utils/geocoding"
import { useReports } from "@/contexts/reports-context"
import { cn } from "@/lib/utils"

const scamTypes = [
  { id: "Fake Job Offer", label: "Fake Job Offer", icon: Briefcase, description: "Unverified job pipelines demanding immediate payment." },
  { id: "Unpaid Work", label: "Unpaid Work", icon: DollarSign, description: "Completed modules remaining uncompensated by client nodes." },
  { id: "Portfolio Theft", label: "Portfolio Theft", icon: UserX, description: "Unauthorized cloning of intellectual property or assets." },
  { id: "Upfront Payment Scam", label: "Upfront Payment", icon: Lock, description: "Advance fee extraction protocols masked as 'security' deposits." },
  { id: "Identity Theft", label: "Identity Theft", icon: ShieldAlert, description: "Malicious attempts to exfiltrate personal data structures." },
  { id: "Other", label: "Other", icon: HelpCircle, description: "Undefined fraudulent architectural behaviors." },
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
        toast({ title: "LIMIT EXCEEDED", description: "Maximum of 5 files allowed.", variant: "destructive" })
        return
      }
      const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast({ title: "FILE TOO LARGE", description: "Files must not exceed 5MB.", variant: "destructive" })
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
        toast({ title: "MISSING INFO", description: "Please select a scam vector classification.", variant: "destructive" })
        return
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.description) {
        toast({ title: "INCOMPLETE DOSSIER", description: "Dossier title and description parameters are required.", variant: "destructive" })
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
      toast({ title: "VERIFICATION FAILED", description: "Incorrect CAPTCHA response.", variant: "destructive" })
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
          toast({ title: "UPLOADS SECURED", description: "Evidence payloads stored." })
        } catch (uploadError) {
          toast({ title: "UPLOAD ERROR", description: "Some file packets failed to transmit.", variant: "destructive" })
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
      })

      if (newReport) {
        toast({ title: "DOSSIER SUBMITTED", description: "Your report has been logged and queued for consensus review." })
        router.push(`/report/success/${newReport.id}`)
      } else {
        throw new Error("Submission aborted")
      }
    } catch (error: any) {
      toast({
        title: "SUBMISSION FAILED",
        description: "An error occurred while logging telemetry. Please re-run.",
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
    <div className="min-h-screen bg-[#0C0A09] py-16 relative font-mono text-[#E8DBC8]">
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.06]" />

      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-red-950/30 border border-red-500/20 text-[9px] font-bold text-red-500 uppercase tracking-[0.2em]">
            <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
            SECURE_THREAT_INGESTION_CHANNEL
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground uppercase tracking-widest mb-2">
            Log Threat Scenario
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
            TRANCHE_INGESTION_STEP: {step} OF {totalSteps}
          </p>
          
          {/* Progress Bar */}
          <div className="h-2 w-full max-w-xs mx-auto bg-[#070605] border border-[#1F1914] p-[1px] rounded-none overflow-hidden relative">
            <div 
              className="h-full bg-primary transition-all duration-300 relative" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            >
              {/* Scanline stripe overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[size:4px_100%] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#15110E] border border-[#1F1914] shadow-2xl relative">
          {/* HUD Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/30 pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/30 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/30 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/30 pointer-events-none" />

          {/* Form Header */}
          <div className="border-b border-[#1F1914] p-4 sm:p-6 bg-[#0F0D0B] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <TerminalSquare className="h-4 w-4 text-primary" /> 
              [ INGESTION_SUBMISSION_MATRIX ]
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 bg-[#0C0A09] border border-emerald-950 px-2 py-1 font-bold tracking-widest uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SECURE_LINK_CONNECTED
            </div>
          </div>

          <div className="p-6 sm:p-10">

            {/* STEP 1: SCAM TYPE */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-4 border-b border-[#1F1914]/50 pb-4">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-widest mb-1">01_Vector Classification</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Identify target fraud methodology parameters.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0C0A09]/50 border border-[#1F1914] p-6">
                  {scamTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.scamType === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData(prev => ({ ...prev, scamType: type.id }))}
                        className={cn(
                          "cursor-pointer border p-5 transition-all rounded-none relative select-none",
                          isSelected 
                            ? "border-primary bg-primary/[0.03] shadow-[0_0_15px_rgba(245,158,11,0.05)]" 
                            : "border-[#1F1914] bg-[#15110E] hover:border-primary/40 hover:bg-[#1E1915]/25"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-primary" />
                        )}
                        <div className="flex items-center space-x-4">
                          <div className={cn("p-2 rounded-none border transition-colors", 
                            isSelected 
                              ? "text-primary border-primary bg-primary/10" 
                              : "text-muted-foreground border-[#1F1914] bg-[#0C0A09]"
                          )}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">{type.label}</h3>
                          </div>
                        </div>
                        <p className="text-[9.5px] text-muted-foreground/60 mt-3 leading-relaxed uppercase tracking-wider">{type.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-4 border-b border-[#1F1914]/50 pb-4">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-widest mb-1">02_Forensic Parameters</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Populate variables mapping onto public threat ledgers.</p>
                </div>

                <div className="space-y-6 bg-[#0C0A09]/30 border border-[#1F1914] p-6">
                  <div>
                    <Label htmlFor="title" className="text-[10px] font-bold text-primary mb-2 block uppercase tracking-widest">Report Title *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-[9px] font-bold text-muted-foreground/40 font-mono select-none">&gt;_TITLE:</span>
                      <Input
                        id="title"
                        placeholder="E.G., FAKE JOB CONTRACT PIPELINE"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="pl-16 h-11 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-0 focus-visible:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company" className="text-[10px] font-bold text-primary mb-2 block uppercase tracking-widest">Company / Entity Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/45" />
                        <Input
                          id="company"
                          className="pl-10 h-11 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-0 focus-visible:border-primary"
                          placeholder="E.G., TECHCORP MATRIX SOLUTIONS"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="industry" className="text-[10px] font-bold text-primary mb-2 block uppercase tracking-widest">Industry Classification</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(val: string) => setFormData({ ...formData, industry: val })}
                      >
                        <SelectTrigger className="h-11 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus:ring-0 focus:border-primary">
                          <SelectValue placeholder="SELECT_INDUSTRY" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0C0A09] border-[#1F1914] text-foreground font-mono rounded-none">
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind} className="uppercase tracking-widest text-[10px] focus:bg-primary/20 focus:text-primary">{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-[10px] font-bold text-primary mb-2 block uppercase tracking-widest">Geographical Stamp (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/45" />
                      <Input
                        id="location"
                        className="pl-10 h-11 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none focus-visible:ring-0 focus-visible:border-primary"
                        placeholder="CITY, REGION, OR ONLINE"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-[10px] font-bold text-primary mb-2 block uppercase tracking-widest">Dossier Narrative Description *</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      className="bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none resize-none focus-visible:ring-0 focus-visible:border-primary leading-relaxed"
                      placeholder="DESCRIBE THE INCIDENT METHODOLOGY, DEMAND PROTOCOLS, DOMAINS MIMICKED, OR COMMUNICATIONS..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-4 border-b border-[#1F1914]/50 pb-4">
                  <h2 className="text-lg font-bold text-foreground uppercase tracking-widest mb-1">03_Evidentiary Payload</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Attach files and run node captcha validation.</p>
                </div>

                <div className="bg-[#0C0A09]/30 border border-[#1F1914] p-6 space-y-8">
                  <div>
                    <Label className="mb-3 block text-[10px] font-bold text-primary uppercase tracking-widest">Related Threat Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {commonTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn("cursor-pointer py-1.5 px-3 rounded-none transition-colors text-[9px] font-bold uppercase tracking-widest", 
                            selectedTags.includes(tag) 
                              ? "bg-primary border-primary text-black" 
                              : "bg-[#15110E] text-muted-foreground/60 border-[#1F1914] hover:bg-primary/10 hover:text-primary"
                          )}
                          onClick={() => toggleTag(tag)}
                        >
                          #{tag.replace(/-/g, '_').toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <Label className="mb-3 block text-[10px] font-bold text-primary uppercase tracking-widest">Attach Forensic Evidence (Optional)</Label>
                    <div className="border border-dashed border-[#1F1914] bg-[#070605] p-8 text-center hover:bg-[#15110E]/40 transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        id="evidence-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer block w-full h-full">
                        <Upload className="h-8 w-8 mx-auto text-primary/50 mb-3 group-hover:scale-105 transition-transform" />
                        <span className="text-xs font-bold text-foreground block uppercase tracking-widest">
                          [ Drag/Upload Screenshots or PDF Dossiers ]
                        </span>
                        <span className="text-[9px] text-muted-foreground/45 mt-1 block uppercase tracking-wider">
                          Limit 5 files. Max size 5MB each.
                        </span>
                      </label>
                    </div>

                    {/* File Preview */}
                    {evidenceFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative group bg-[#15110E] border border-[#1F1914] p-3 flex items-center justify-between"
                          >
                            <div className="flex flex-col flex-1 truncate font-mono text-[9px] uppercase tracking-wider pr-4">
                              <p className="font-bold text-foreground truncate">
                                {file.name}
                              </p>
                              <p className="text-muted-foreground/40 mt-0.5">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-muted-foreground hover:text-red-500 border border-[#1F1914] bg-[#0C0A09] p-1.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#1F1914] pt-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="anonymous"
                        checked={formData.anonymous}
                        onCheckedChange={(c: boolean) => setFormData({ ...formData, anonymous: !!c })}
                        className="border-[#1F1914] data-[state=checked]:bg-primary data-[state=checked]:text-black h-5 w-5 rounded-none"
                      />
                      <Label htmlFor="anonymous" className="cursor-pointer text-xs font-bold uppercase tracking-widest text-[#E7E5E4]">
                        Encrypt Submitter Identity (Anonymous submission)
                      </Label>
                    </div>

                    {!formData.anonymous && (
                      <div className="pl-8 animate-in fade-in duration-200">
                        <Label htmlFor="email" className="text-[10px] font-bold text-primary mb-2 block uppercase tracking-widest">Contact Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="EMAIL@DOMAIN.COM"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none max-w-sm focus-visible:ring-0 focus-visible:border-primary"
                        />
                      </div>
                    )}
                  </div>

                  {/* CAPTCHA validation */}
                  <div className="bg-[#15110E] border border-[#1F1914] p-5 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="flex-1">
                        <Label className="text-[10px] font-bold text-red-500 mb-2 block uppercase tracking-widest">
                          [ HANDSHAKE_CHALLENGE: RESOLVE CAPTCHA ]
                        </Label>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold font-mono tracking-widest bg-[#0C0A09] border border-[#1F1914] px-4 py-3 min-w-[100px] text-center select-none text-[#F59E0B]">
                            {captchaQuestion}
                          </span>
                          <Input
                            type="number"
                            placeholder="???"
                            value={userCaptchaInput}
                            onChange={(e) => setUserCaptchaInput(e.target.value)}
                            className="h-12 bg-[#070605] border-[#1F1914] text-foreground font-mono text-xs uppercase tracking-widest rounded-none max-w-[120px] focus-visible:ring-0 focus-visible:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons Deck */}
            <div className="mt-8 flex justify-between pt-6 border-t border-[#1F1914]">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="h-11 px-6 font-mono text-xs uppercase font-bold tracking-widest rounded-none border-[#1F1914] bg-[#0C0A09] hover:bg-[#15110E] text-muted-foreground hover:text-foreground transition-all"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> [ PREV_STEP ]
                </Button>
              ) : (
                <div />
              )}

              {step < totalSteps ? (
                <Button 
                  onClick={handleNext} 
                  className="h-11 px-8 font-mono text-xs uppercase font-bold tracking-widest rounded-none bg-transparent border border-[#1F1914] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-black hover:border-[#F59E0B] transition-all"
                >
                  [ NEXT_STEP ] <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || isUploadingEvidence} 
                  className="h-11 px-8 font-mono text-xs uppercase font-black tracking-widest rounded-none bg-primary text-black hover:bg-white border border-primary transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> SUBMITTING_DOSSIER...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> DISPATCH_REPORT</>
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
