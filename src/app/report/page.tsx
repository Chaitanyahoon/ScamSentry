"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  AlertTriangle, MapPin, Building, Tag, FileText, Send, Loader2,
  Briefcase, DollarSign, UserX, Lock, ShieldAlert, HelpCircle,
  ChevronRight, ChevronLeft, Upload, X, TerminalSquare
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
        toast({ title: "Limit Exceeded", description: "Maximum of 5 files allowed.", variant: "destructive" })
        return
      }
      const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast({ title: "File Too Large", description: "Files must not exceed 5MB.", variant: "destructive" })
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
        toast({ title: "Missing Information", description: "Please select a scam type.", variant: "destructive" })
        return
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.description) {
        toast({ title: "Incomplete Data", description: "Title and description are required.", variant: "destructive" })
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
      toast({ title: "Verification Failed", description: "Incorrect CAPTCHA answer.", variant: "destructive" })
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
          toast({ title: "Files Uploaded", description: "Evidence processed successfully." })
        } catch (uploadError) {
          toast({ title: "Upload Error", description: "Some files failed to transfer.", variant: "destructive" })
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
        toast({ title: "Report Submitted", description: "Your report has been received and is pending review." })
        router.push(`/report/success/${newReport.id}`)
      } else {
        throw new Error("Submission aborted")
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting. Please try again.",
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
    <div className="min-h-screen bg-background py-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6 inline-flex p-4 rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Report a Scenario
          </h1>
          <p className="text-sm text-muted-foreground font-medium mb-8">
            Step {step} of {totalSteps}
          </p>
          
          {/* Progress Bar */}
          <div className="h-2 w-full max-w-md mx-auto bg-card border border-border rounded-full overflow-hidden">
             <div 
               className="h-full bg-primary transition-all duration-300" 
               style={{ width: `${(step / totalSteps) * 100}%` }}
             />
          </div>
        </div>

        <div className="bg-card border border-border shadow-sm">
          <div className="border-b border-border p-4 sm:p-6 bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground tracking-wider uppercase">
              <TerminalSquare className="h-4 w-4 text-primary" /> Submission Form
            </div>
          </div>
          <div className="p-6 sm:p-10">

            {/* STEP 1: SCAM TYPE */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Identify the Scenario</h2>
                  <p className="text-sm text-muted-foreground">Select the category that best describes the incident.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border bg-background/50 p-6">
                  {scamTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.scamType === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData(prev => ({ ...prev, scamType: type.id }))}
                        className={cn(
                          "cursor-pointer border p-5 transition-colors bg-card",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn("p-2", isSelected ? "text-primary bg-primary/10" : "text-muted-foreground bg-background border border-border")}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{type.label}</h3>
                          </div>
                        </div>
                         <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{type.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Provide Details</h2>
                  <p className="text-sm text-muted-foreground">The more information you provide, the easier it is for others to identify the threat.</p>
                </div>

                <div className="space-y-6 bg-background/50 border border-border p-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-semibold mb-2 block">Report Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Fake Web Developer Job Offer"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="h-11 bg-card border-border"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company" className="text-sm font-semibold mb-2 block">Company / Client Name</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="company"
                          className="pl-10 h-11 bg-card border-border"
                          placeholder="Name of entity"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="industry" className="text-sm font-semibold mb-2 block">Select Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(val: string) => setFormData({ ...formData, industry: val })}
                      >
                        <SelectTrigger className="h-11 bg-card border-border">
                          <SelectValue placeholder="Industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-semibold mb-2 block">Location (Optional)</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10 h-11 bg-card border-border"
                        placeholder="City, Region, or Online"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold mb-2 block">Description of Incident *</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      className="mt-1 bg-card border-border resize-none"
                      placeholder="Describe exactly what happened, how they contacted you, and any red flags..."
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
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Finalize & Submit</h2>
                  <p className="text-sm text-muted-foreground">Review your information and add any supporting evidence.</p>
                </div>

                <div className="bg-background/50 border border-border p-6 space-y-8">
                  <div>
                    <Label className="mb-3 block text-sm font-semibold">Related Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {commonTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn("cursor-pointer py-1.5 px-3 rounded-sm transition-colors cursor-pointer text-xs font-medium", 
                            selectedTags.includes(tag) 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-card text-muted-foreground border-border hover:bg-muted"
                          )}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Evidence Upload */}
                  <div>
                    <Label className="mb-3 block text-sm font-semibold">Supporting Evidence (Optional)</Label>
                    <div className="border border-dashed border-border bg-card p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="evidence-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer block w-full h-full">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                         <span className="text-sm font-semibold text-foreground block">
                          Click to upload screenshots or PDFs
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          Limit 5 files, 5MB each.
                        </span>
                      </label>
                    </div>

                    {/* File Preview */}
                    {evidenceFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative group bg-card border border-border p-3 flex"
                          >
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-background text-muted-foreground hover:text-destructive border border-border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="flex flex-col flex-1 truncate">
                               <p className="text-xs font-medium text-foreground truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="anonymous"
                        checked={formData.anonymous}
                        onCheckedChange={(c: boolean) => setFormData({ ...formData, anonymous: !!c })}
                        className="border-primary data-[state=checked]:bg-primary h-5 w-5 rounded-sm"
                      />
                      <Label htmlFor="anonymous" className="cursor-pointer text-sm font-medium">Submit Anonymously</Label>
                    </div>

                    {!formData.anonymous && (
                      <div className="pl-8">
                        <Label htmlFor="email" className="text-sm font-medium text-muted-foreground mb-2 block">Contact Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="For updates on this report"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11 bg-card border-border max-w-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-card border border-border p-5 mt-6">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                      <div className="flex-1">
                        <Label className="text-sm font-semibold mb-2 block">Verification: {captchaQuestion}</Label>
                        <Input
                          type="number"
                          placeholder="Enter answer"
                          value={userCaptchaInput}
                          onChange={(e) => setUserCaptchaInput(e.target.value)}
                          className="h-11 bg-background border-border max-w-[200px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between pt-6 border-t border-border">
               {step > 1 ? (
                 <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="h-11 px-6 font-semibold"
                 >
                   <ChevronLeft className="mr-2 h-4 w-4" /> Back
                 </Button>
               ) : (
                 <div /> // Placeholder for styling
               )}

              {step < totalSteps ? (
                 <Button 
                   onClick={handleNext} 
                   className="h-11 px-8 font-semibold"
                 >
                   Next Step <ChevronRight className="ml-2 h-4 w-4" />
                 </Button>
               ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="h-11 px-8 font-semibold"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Submit Report</>
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
