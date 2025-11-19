"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  AlertTriangle, MapPin, Building, Tag, FileText, Send, Loader2,
  Briefcase, DollarSign, UserX, Lock, ShieldAlert, HelpCircle,
  ChevronRight, ChevronLeft, Upload, X, ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
  { id: "Fake Job Offer", label: "Fake Job Offer", icon: Briefcase, description: "Job offers that require payment or seem too good to be true." },
  { id: "Unpaid Work", label: "Unpaid Work", icon: DollarSign, description: "Work completed but payment was never received." },
  { id: "Portfolio Theft", label: "Portfolio Theft", icon: UserX, description: "Someone using your work and claiming it as their own." },
  { id: "Upfront Payment Scam", label: "Upfront Payment", icon: Lock, description: "Asking for money before starting a job or project." },
  { id: "Identity Theft", label: "Identity Theft", icon: ShieldAlert, description: "Attempts to steal personal information." },
  { id: "Other", label: "Other Scam", icon: HelpCircle, description: "Any other type of fraudulent activity." },
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

  // Evidence upload state
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false)

  // CAPTCHA state
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
      // Limit to 5 files total
      if (evidenceFiles.length + newFiles.length > 5) {
        toast({ title: "Too Many Files", description: "You can upload a maximum of 5 files.", variant: "destructive" })
        return
      }
      // Check file size (max 5MB per file)
      const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast({ title: "File Too Large", description: "Each file must be under 5MB.", variant: "destructive" })
        return
      }
      setEvidenceFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    // Validation per step
    if (step === 1) {
      if (!formData.scamType) {
        toast({ title: "Selection Required", description: "Please select a scam type.", variant: "destructive" })
        return
      }
    }
    if (step === 2) {
      if (!formData.title || !formData.description) {
        toast({ title: "Missing Information", description: "Please provide a title and description.", variant: "destructive" })
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
      toast({ title: "CAPTCHA Error", description: "Incorrect answer.", variant: "destructive" })
      generateCaptcha()
      return
    }

    setIsSubmitting(true)
    try {
      // Upload evidence files first
      let evidenceUrls: string[] = []
      if (evidenceFiles.length > 0) {
        setIsUploadingEvidence(true)
        try {
          const uploadPromises = evidenceFiles.map(file => uploadEvidence(file))
          evidenceUrls = await Promise.all(uploadPromises)
          toast({ title: "Files Uploaded", description: `${evidenceFiles.length} file(s) uploaded successfully.` })
        } catch (uploadError) {
          console.error("Error uploading evidence:", uploadError)
          toast({ title: "Upload Failed", description: "Some files failed to upload. Continuing without them.", variant: "destructive" })
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
        location: formData.location || "Location not specified",
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
        toast({ title: "Report Submitted", description: "Thank you for helping the community!" })
        router.push(`/report/success/${newReport.id}`)
      } else {
        throw new Error("Failed to create report")
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Report a Scam</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Step {step} of {totalSteps}</p>
          <Progress value={(step / totalSteps) * 100} className="h-2 mt-4 w-full max-w-xs mx-auto" />
        </div>

        <Card className="border-none shadow-xl bg-white dark:bg-gray-800">
          <CardContent className="p-6 sm:p-8">

            {/* STEP 1: SCAM TYPE */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">What type of scam is it?</h2>
                  <p className="text-sm text-gray-500">Select the category that best fits your experience.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scamTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.scamType === type.id
                    return (
                      <div
                        key={type.id}
                        onClick={() => setFormData(prev => ({ ...prev, scamType: type.id }))}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary hover:bg-primary/5",
                          isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 dark:border-gray-700"
                        )}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                            <p className="text-xs text-gray-500 mt-1">{type.description}</p>
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
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Tell us what happened</h2>
                  <p className="text-sm text-gray-500">The more details you provide, the better we can help others.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Report Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Fake Job Offer from TechCorp"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company Name</Label>
                      <div className="relative mt-1">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="company"
                          className="pl-9"
                          placeholder="Name of company or scammer"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(val: string) => setFormData({ ...formData, industry: val })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        className="pl-9"
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      rows={6}
                      className="mt-1"
                      placeholder="Describe the incident in detail. What did they ask for? How did they contact you?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & SUBMIT */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Final Details</h2>
                  <p className="text-sm text-gray-500">Add tags and verify your submission.</p>
                </div>

                <div>
                  <Label className="mb-2 block">Tags (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer py-1.5 px-3"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Evidence Upload */}
                <div>
                  <Label className="mb-2 block">Upload Evidence (Optional)</Label>
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <input
                        type="file"
                        id="evidence-upload"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="evidence-upload" className="cursor-pointer block">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Click to upload screenshots or documents
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, PDF up to 5MB each (max 5 files)
                        </p>
                      </label>
                    </div>

                    {/* File Preview */}
                    {evidenceFiles.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                          >
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                {file.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={formData.anonymous}
                      onCheckedChange={(c: boolean) => setFormData({ ...formData, anonymous: c })}
                    />
                    <Label htmlFor="anonymous" className="cursor-pointer">Submit anonymously</Label>
                  </div>

                  {!formData.anonymous && (
                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="For status updates"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>CAPTCHA: {captchaQuestion}</Label>
                  <Input
                    type="number"
                    placeholder="Answer"
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

          </CardContent>

          <CardFooter className="flex justify-between p-6 sm:p-8 border-t bg-gray-50/50 dark:bg-gray-900/50">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className={step === 1 ? "invisible" : ""}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Report
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
