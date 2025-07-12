"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState, useEffect } from "react"
import { AlertTriangle, MapPin, Building, Tag, FileText, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { geocodeCity } from "@/utils/geocoding"
import { useReports } from "@/contexts/reports-context"

const scamTypes = [
  "Fake Job Offer",
  "Unpaid Work",
  "Portfolio Theft",
  "Upfront Payment Scam",
  "Ghost Client",
  "Fake Training/Certification",
  "Identity Theft",
  "Phishing Attempt",
  "Other",
]

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
]

export default function ReportPage() {
  const { toast } = useToast()
  const router = useRouter()
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CAPTCHA state
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null)
  const [userCaptchaInput, setUserCaptchaInput] = useState("")

  // Generate CAPTCHA on component mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1 // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1 // 1-10
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setCaptchaAnswer(num1 + num2)
    setUserCaptchaInput("") // Clear user input for new question
  }

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
  ]

  const { addReport } = useReports()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // CAPTCHA validation
    if (Number.parseInt(userCaptchaInput) !== captchaAnswer) {
      toast({
        title: "CAPTCHA Error",
        description: "Please solve the math problem correctly.",
        variant: "destructive",
      })
      generateCaptcha() // Generate a new CAPTCHA on failure
      setIsSubmitting(false)
      return
    }

    // Basic validation
    if (!formData.title || !formData.scamType || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Geocode location if provided
      let locationData = {
        city: "",
        state: "",
        country: "",
        lat: undefined as number | undefined,
        lng: undefined as number | undefined,
      }

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

      // Determine risk level based on scam type and tags
      const highRiskTypes = ["Fake Job Offer", "Upfront Payment Scam", "Identity Theft", "Phishing Attempt"]
      const highRiskTags = ["upfront-payment", "fake-training", "identity-theft", "phishing"]

      const isHighRisk =
        highRiskTypes.includes(formData.scamType) || selectedTags.some((tag) => highRiskTags.includes(tag))

      const riskLevel = isHighRisk ? "high" : formData.scamType === "Other" ? "low" : "medium"

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Add report to context and get the new report object
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
      })

      if (!newReport) {
        toast({
          title: "Submission Error",
          description: "Failed to add report to the database. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // The rest of the success logic remains the same
      toast({
        title: "Report Submitted Successfully!",
        description: "Your report is now live and visible to the community. Thank you for helping!",
      })

      // Redirect to the success page with the new report's ID
      router.push(`/report/success/${newReport.id}`)

      // Reset form (optional, as we're redirecting)
      setFormData({
        title: "",
        company: "",
        scamType: "",
        industry: "",
        location: "",
        description: "",
        anonymous: true,
        email: "",
      })
      setSelectedTags([])
      generateCaptcha() // Generate new CAPTCHA after successful submission
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Report a Scam</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Help protect the freelancer community by sharing your experience
            </p>
          </div>

          <Card className="mx-auto">
            {" "}
            {/* Added mx-auto for explicit centering */}
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Scam Report Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the scam (e.g., 'Fake Web Development Job - TechCorp')"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Company and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company/Client Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="company"
                        placeholder="Company or client name"
                        value={formData.company}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location (Optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="City, State/Country"
                        value={formData.location}
                        onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Scam Type and Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scamType">Scam Type *</Label>
                    <Select
                      value={formData.scamType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, scamType: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select scam type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scamTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what happened, how you were contacted, what red flags you noticed, and any other relevant details..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label className="flex items-center mb-3">
                    <Tag className="mr-2 h-4 w-4" />
                    Tags (Select all that apply)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => !isSubmitting && toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Anonymous Reporting */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={formData.anonymous}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, anonymous: checked as boolean }))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="anonymous" className="text-sm">
                    Submit anonymously (recommended)
                  </Label>
                </div>

                {/* Email for updates */}
                {!formData.anonymous && (
                  <div>
                    <Label htmlFor="email">Email (for updates only)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* CAPTCHA */}
                <div>
                  <Label htmlFor="captcha">CAPTCHA: {captchaQuestion} *</Label>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Your answer"
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="mt-8 mx-auto">
            {" "}
            {/* Added mx-auto for explicit centering */}
            <CardHeader>
              <CardTitle className="text-lg">Reporting Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                • <strong>Be specific:</strong> Include as many details as possible to help others identify similar
                scams.
              </p>
              <p>
                • <strong>Stay factual:</strong> Report only what actually happened to you or what you witnessed.
              </p>
              <p>
                • <strong>Protect privacy:</strong> Don't include personal information of individuals unless it's
                publicly available.
              </p>
              <p>
                • <strong>No defamation:</strong> Focus on describing the scam behavior rather than making personal
                attacks.
              </p>
              <p>
                • <strong>Community first:</strong> Your report helps protect other freelancers from similar
                experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
