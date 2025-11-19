import Link from "next/link"
import { Shield, Github, Twitter, Mail, CheckCircle, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Gradient Border Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="container relative z-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="group flex items-center space-x-2 mb-4 w-fit">
              <div className="relative">
                <Shield className="h-8 w-8 text-purple-500 group-hover:text-purple-400 transition-colors" />
                <div className="absolute inset-0 bg-purple-500 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ScamSentry
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              Protecting freelancers from scams through community-driven reporting and verification. Join thousands of
              freelancers building a safer work environment.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-gray-800 hover:bg-purple-600 transition-all duration-300 hover:scale-110"
              >
                <Github className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
              <Link
                href="#"
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-gray-800 hover:bg-blue-500 transition-all duration-300 hover:scale-110"
              >
                <Twitter className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
              <Link
                href="#"
                className="group flex items-center justify-center h-10 w-10 rounded-lg bg-gray-800 hover:bg-red-500 transition-all duration-300 hover:scale-110"
              >
                <Mail className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/report" className="group text-gray-400 hover:text-purple-400 transition-colors flex items-center">
                  <span className="animated-underline">Report Scam</span>
                </Link>
              </li>
              <li>
                <Link href="/reports" className="group text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Browse Reports</span>
                </Link>
              </li>
              <li>
                <Link href="/map" className="group text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Scam Map</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/safe-companies"
                  className="group text-gray-400 hover:text-green-400 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2 group-hover:text-green-400" />
                  <span className="animated-underline">Safe Companies</span>
                </Link>
              </li>
              <li>
                <Link href="/community" className="group text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Community</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Help Center</span>
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Guidelines</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <span className="animated-underline">Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            © 2025 ScamSentry. Built with
            <Heart className="h-4 w-4 text-red-500 animate-pulse-glow" />
            for the freelancer community.
          </p>
        </div>
      </div>
    </footer>
  )
}
