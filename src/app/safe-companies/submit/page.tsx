"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building, Send, Loader2, Tag, Terminal } from "lucide-react"
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
        title: "SYS_ERR: CAPTCHA_MISMATCH",
        description: "HANDSHAKE FAILED. INVALID MATHEMATICAL PROOF.",
        variant: "destructive",
      })
      generateCaptcha() 
      setIsSubmitting(false)
      return
    }

    if (!formData.name || !formData.industry || !formData.description) {
      toast({
        title: "SYS_ERR: MISSING_PARAMETERS",
        description: "REQUIRED METADATA MISSING FROM PAYLOAD.",
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
        title: "SUCCESS: PAYLOAD_RECEIVED",
        description: "NODE DATA SUBMITTED TO QUARANTINE FOR ADMIN REVIEW.",
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
        title: "SYS_ERR: KERNEL_PANIC",
        description: "UNABLE TO WRITE TO MAINFRAME DB.",
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
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.2]" />

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center border border-success/50 bg-success/10 shadow-[0_0_15px_hsla(var(--success),0.3)]">
                <Building className="h-8 w-8 text-success drop-shadow-[0_0_8px_currentColor]" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-widest uppercase text-foreground sm:text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              PROPOSE <span className="text-success drop-shadow-[0_0_10px_hsla(var(--success),0.5)]">WHITELIST_NODE</span>
            </h1>
            <p className="mt-4 text-xs font-mono tracking-widest uppercase text-muted-foreground">
              SUBMIT A LEGITIMATE ORGANIZATION FOR PEER-REVIEW INTO THE SYSTEM LEDGER.
            </p>
          </div>

          <div className="glass-strong mb-10 overflow-hidden rounded-none shadow-[0_0_20px_hsla(var(--border),0.5)] border-t-2 border-t-success">
            <div className="bg-card/80 border-b border-border p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground tracking-widest uppercase font-mono">
                <Terminal className="h-4 w-4 text-success" /> NEW_NODE_REGISTRATION
              </div>
            </div>
            
            <div className="p-6 bg-background/50">
              <form onSubmit={handleSubmit} className="space-y-6 font-mono">
                <div>
                  <Label htmlFor="name" className="text-xs font-bold tracking-widest uppercase text-foreground mb-2 block">
                    TARGET_ORG_NAME <span className="text-success">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="ENTER DESIGNATION..."
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    className="bg-card border-border rounded-none tracking-widest text-xs h-12 focus-visible:ring-success focus-visible:border-success"
                  />
                </div>

                <div>
                  <Label htmlFor="industry" className="text-xs font-bold tracking-widest uppercase text-foreground mb-2 block">
                    SECTOR_CLASSIFICATION <span className="text-success">*</span>
                  </Label>
                  <Input
                    id="industry"
                    placeholder="E.G. DEVELOPMENT, DESIGN, MARKETING..."
                    value={formData.industry}
                    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                    required
                    disabled={isSubmitting}
                    className="bg-card border-border rounded-none tracking-widest text-xs h-12 focus-visible:ring-success focus-visible:border-success"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-xs font-bold tracking-widest uppercase text-foreground mb-2 block">
                    ROOT_DOMAIN_URL <span className="text-muted-foreground font-normal">(OPTIONAL)</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    disabled={isSubmitting}
                    className="bg-card border-border rounded-none tracking-widest text-xs h-12 focus-visible:ring-success focus-visible:border-success"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-xs font-bold tracking-widest uppercase text-foreground mb-2 block">
                    TRUST_HEURISTIC_EVIDENCE <span className="text-success">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="PROVIDE LOGICAL PROOF FOR TRUST STATUS..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={5}
                    required
                    disabled={isSubmitting}
                    className="bg-card border-border rounded-none tracking-widest text-xs focus-visible:ring-success focus-visible:border-success resize-y"
                  />
                </div>

                <div>
                  <Label className="flex items-center mb-3 text-xs font-bold tracking-widest uppercase text-foreground">
                    <Tag className="mr-2 h-4 w-4 text-success" />
                    SELECT_TAG_VECTORS
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer rounded-none border text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 transition-all ${
                          selectedTags.includes(tag) 
                            ? "bg-success/20 text-success border-success shadow-[0_0_5px_hsla(var(--success),0.5)]" 
                            : "bg-card border-border text-muted-foreground hover:border-success/50 hover:bg-success/10"
                        }`}
                        onClick={() => !isSubmitting && toggleTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-success/5 border border-success/30 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-success"></div>
                  <Label htmlFor="captcha" className="text-xs font-bold tracking-widest uppercase text-success mb-3 block drop-shadow-[0_0_5px_currentColor]">
                    ANTI_BOT_PROTCOL: SOLVE [ {captchaQuestion} ] <span className="text-foreground">*</span>
                  </Label>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="EVALUATE..."
                    value={userCaptchaInput}
                    onChange={(e) => setUserCaptchaInput(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="bg-black/50 border-success/50 text-success rounded-none tracking-widest font-bold text-lg h-12 focus-visible:ring-success focus-visible:border-success w-full sm:w-1/3"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full sm:w-auto rounded-none font-bold uppercase tracking-widest bg-success text-black hover:bg-success/80 border border-transparent hover:border-success hover:shadow-[0_0_15px_hsla(var(--success),0.5)] transition-all h-12" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        UPLOADING...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        TRANSMIT_PAYLOAD
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <div className="glass-card bg-card/50 border border-border p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-muted-foreground" /> SYSTEM_GUIDELINES
            </h3>
            <div className="space-y-3 text-[10px] font-mono tracking-widest text-muted-foreground leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-primary mt-0.5">{'>'}</span> 
                <strong>PRECISE_DATA:</strong> ONLY UPLOAD VERIFIABLE METADATA REGARDING ORG STRUCTURE.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary mt-0.5">{'>'}</span> 
                <strong>NO_SELF_PROMOTION:</strong> CONFLICTS OF INTEREST WILL TRIGGER AUTO-DELETION PROTOCOLS.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-primary mt-0.5">{'>'}</span> 
                <strong>MODERATOR_OVERSIGHT:</strong> ALL UPLOADS MUST CLEAR HUMAN SYS-ADMIN AUDITING BEFORE LEDGER INCLUSION.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
