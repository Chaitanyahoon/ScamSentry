import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { HomeClientContent } from "@/components/home-client-content" // Import the new client wrapper

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <HomeClientContent /> {/* Render the client wrapper here */}
      <Features />
    </div>
  )
}
