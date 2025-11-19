"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building, CheckCircle, Send, Loader2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      // Insert into Firebase
      await addDoc(collection(db, "safe_companies"), {
        name: formData.name,
        industry: formData.industry,
        description: formData.description,
        website: formData.website || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        verified_score: 50, // Default score, can be adjusted by admins
        status: "pending", // New companies need to be approved
        created_at: Timestamp.now(),
      })

      toast({
        title: "Company Submitted Successfully!",
        description: "Thank you for contributing! Your submission is now under review.",
      })

      // Reset form
      setFormData({
        name: "",
        industry: "",
        description: "",
        website: "",
      })
      setSelectedTags([])
      generateCaptcha() // Generate new CAPTCHA after successful submission

      // Optionally redirect to the safe companies list or a success page
      router.push("/safe-companies")
    } catch (error) {
      console.error("Unexpected error during submission:", error)
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Suggest a Safe Company</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Help us build a list of trusted clients and companies for the freelancer community.
            </p>
          </div>

          <Card className="mx-auto">
            {" "}
            {/* Added mx-auto for explicit centering */}
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Company Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Acme Corp"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Industry */}
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Web Development, Digital Marketing"
                    value={formData.industry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Website */}
                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe why this company is trustworthy, your experience working with them, etc."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={5}
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
                        Submit Company
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
              <CardTitle className="text-lg">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>
                • <strong>Be accurate:</strong> Provide truthful and verifiable information about the company.
              </p>
              <p>
                • <strong>Be descriptive:</strong> Explain clearly why you recommend this company.
              </p>
              <p>
                • <strong>No self-promotion:</strong> Do not submit your own company or companies you have a direct
                financial interest in.
              </p>
              <p>
                • <strong>Quality over quantity:</strong> Focus on providing detailed insights for a few trusted
                companies.
              </p>
              <p>
                • <strong>Review process:</strong> All submissions will be reviewed by our moderation team before being
                published.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
