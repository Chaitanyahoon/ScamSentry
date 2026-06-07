"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building, Send, Loader2, Tag, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, Timestamp } from "firebase/firestore"

const commonTags = [
  "transparent",
  "reliable-payment",
  "long-term-projects",
  "supportive-team",
  "clear-communication",
  "fair-rates",
  "good-reviews",
  "established",
  "ethical",
]

export default function SubmitSafeCompanyPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
  })
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CAPTCHA state
  const [captchaQuestion, setCaptchaQuestion] = useState("")
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null)
  const [userCaptchaInput, setUserCaptchaInput] = useState("")

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1 // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1 // 1-10
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setCaptchaAnswer(num1 + num2)
    setUserCaptchaInput("") 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (Number.parseInt(userCaptchaInput) !== captchaAnswer) {
      toast({
        title: "Verification Failed",
        description: "Please solve the arithmetic check correctly to submit.",
        variant: "destructive",
      })
      generateCaptcha() 
      setIsSubmitting(false)
      return
    }

    if (!formData.name || !formData.industry || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      await addDoc(collection(db, "safe_companies"), {
        name: formData.name,
        industry: formData.industry,
        description: formData.description,
        website: formData.website || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        verified_score: 50, 
        status: "pending", 
        created_at: Timestamp.now(),
      })

      toast({
        title: "Submission Received",
        description: "The company has been submitted and is awaiting administrator review.",
      })

      setFormData({
        name: "",
        industry: "",
        description: "",
        website: "",
      })
      setSelectedTags([])
      generateCaptcha() 

      router.push("/safe-companies")
    } catch (error) {
      console.error("Unexpected error during submission:", error)
      toast({
        title: "Submission Error",
        description: "Unable to save your submission. Please try again later.",
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
    <div className="min-h-screen bg-background py-16 relative overflow-hidden">
      {/* Soft Decorative Background */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.05]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-success/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Back button */}
          <Link 
            href="/safe-companies" 
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Safe Companies
          </Link>

          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-success/20 bg-success/10 text-success">
                <Building className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Propose a <span className="text-success">Safe Company</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Recommend a trustworthy company or client with a track record of fair practices and reliable payments.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="border-b border-border bg-muted/30 px-6 py-4">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-success" /> Company Registration Details
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                    Company Name <span className="text-success">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    className="bg-background border-border rounded-xl h-11 focus-visible:ring-success/50 focus-visible:border-success"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-xs font-semibold text-foreground">
                    Industry / Sector <span className="text-success">*</span>
                  </Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Software Development, Marketing, Retail"
                    value={formData.industry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    className="bg-background border-border rounded-xl h-11 focus-visible:ring-success/50 focus-visible:border-success"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs font-semibold text-foreground">
                    Website URL <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    disabled={isSubmitting}
                    className="bg-background border-border rounded-xl h-11 focus-visible:ring-success/50 focus-visible:border-success"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-semibold text-foreground">
                    Why is this company safe? <span className="text-success">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe their payment reliability, communication style, or other details showing they are trustworthy."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                    disabled={isSubmitting}
                    className="bg-background border-border rounded-xl focus-visible:ring-success/50 focus-visible:border-success resize-y py-3"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center text-xs font-semibold text-foreground">
                    <Tag className="mr-1.5 h-4 w-4 text-success" />
                    Select Relevant Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer rounded-full border text-[11px] font-medium px-3 py-1 transition-all ${
                            isSelected 
                              ? "bg-success/10 text-success border-success/45 hover:bg-success/20" 
                              : "bg-background border-border text-muted-foreground hover:border-success/30 hover:bg-success/5"
                          }`}
                          onClick={() => !isSubmitting && toggleTag(tag)}
                        >
                          {tag.replace("-", " ")}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-success/5 border border-success/10 rounded-xl p-4 space-y-3">
                  <Label htmlFor="captcha" className="text-xs font-semibold text-success block">
                    Security Verification: Solve the problem <span className="text-foreground">*</span>
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="bg-background border border-border px-4 py-2.5 rounded-xl text-foreground font-mono font-semibold text-sm">
                      {captchaQuestion}
                    </div>
                    <Input
                      id="captcha"
                      type="number"
                      placeholder="Answer"
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="bg-background border-border rounded-xl text-center font-bold text-sm h-10 w-full sm:w-28 focus-visible:ring-success/50 focus-visible:border-success"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full sm:w-auto rounded-xl font-medium bg-success text-white hover:bg-success/90 h-11 px-6 shadow-md shadow-success/10 transition-all" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Company
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
              Submission Guidelines
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">•</span> 
                <strong>Accurate Information:</strong> Only submit verified and real company details and website URLs.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">•</span> 
                <strong>No Self-Promotion:</strong> Submissions created to artificially boost your own rating will be removed.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success font-bold">•</span> 
                <strong>Moderator Oversight:</strong> Submissions must pass administrative audit before appearing on the public ledger.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
