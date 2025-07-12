import Link from "next/link"
import { Shield, Github, Twitter, Mail, CheckCircle } from "lucide-react" // Added CheckCircle

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold">ScamSentry</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Protecting freelancers from scams through community-driven reporting and verification. Join thousands of
              freelancers building a safer work environment.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/report" className="text-gray-400 hover:text-white transition-colors">
                  Report Scam
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-gray-400 hover:text-white transition-colors">
                  Browse Reports
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-gray-400 hover:text-white transition-colors">
                  Scam Map
                </Link>
              </li>
              <li>
                <Link
                  href="/safe-companies"
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Safe Companies
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-400 hover:text-white transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-gray-400 hover:text-white transition-colors">
                  Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 ScamSentry. All rights reserved. Built by the ScamSentry team for the freelancer community.</p>
        </div>
      </div>
    </footer>
  )
}
