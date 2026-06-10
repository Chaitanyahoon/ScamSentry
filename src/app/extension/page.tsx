"use client";

import { useState } from "react";
import {
  Download,
  FolderOpen,
  Chrome,
  ToggleRight,
  PlusCircle,
  RefreshCw,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Info
} from "lucide-react";
import Link from "next/link";

export default function ExtensionSetupPage() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Download the Package",
      icon: <Download className="h-5 w-5" />,
      shortDesc: "Get the ScamSentry Shield extension ZIP archive.",
      detailedDesc: (
        <div className="space-y-4">
          <p>
            Click the download button below to retrieve the official verified ScamSentry Shield extension.
          </p>
          <div className="p-5 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">ScamSentry-Extension.zip</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0 • Verified Local Build</p>
              </div>
            </div>
            <a
              href="/extension.zip"
              download="ScamSentry-Extension.zip"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/15"
            >
              <Download className="h-4 w-4" />
              Download ZIP
            </a>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-2 bg-muted/20 p-3 rounded-lg">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            Once downloaded, extract the contents of the ZIP archive into a dedicated folder on your local drive (e.g. <code>C:\ScamSentry-Extension</code>). Do not delete this folder after installation, as the browser loads it directly.
          </p>
        </div>
      )
    },
    {
      id: 2,
      title: "Open Extensions Page",
      icon: <Chrome className="h-5 w-5" />,
      shortDesc: "Navigate to the extension manager in your browser.",
      detailedDesc: (
        <div className="space-y-4">
          <p>
            Open a new tab in Google Chrome (or any Chromium browser such as Microsoft Edge, Brave, or Opera).
          </p>
          <p>
            In the address bar, type the following and press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[11px]">Enter</kbd>:
          </p>
          <div className="p-4 bg-muted/40 border border-border rounded-xl font-mono text-sm flex items-center justify-between">
            <code className="text-primary select-all">chrome://extensions</code>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Copy Address</span>
          </div>
          <p className="text-sm text-muted-foreground">
            For Edge, you can also use <code>edge://extensions</code>, and for Brave, <code>brave://extensions</code>.
          </p>
        </div>
      )
    },
    {
      id: 3,
      title: "Enable Developer Mode",
      icon: <ToggleRight className="h-5 w-5" />,
      shortDesc: "Toggle the developer mode switch in the top-right.",
      detailedDesc: (
        <div className="space-y-4">
          <p>
            In the extensions page, look at the top-right corner of the interface.
          </p>
          <p>
            Locate the switch labeled <strong>"Developer mode"</strong> and toggle it to the <strong>ON</strong> position.
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
              <ToggleRight className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Developer mode allows your browser to sideload unpacked source folders, bypassing standard app store download requirements. This is completely safe and standard practice for open-source utilities.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Load Unpacked Folder",
      icon: <PlusCircle className="h-5 w-5" />,
      shortDesc: "Select the extracted folder to install the shield.",
      detailedDesc: (
        <div className="space-y-4">
          <p>
            Once Developer Mode is enabled, a new top menu bar will slide in on the left side of the page.
          </p>
          <p>
            Click the button labeled <strong>"Load unpacked"</strong>.
          </p>
          <p>
            In the file selection window that appears, navigate to and select the <strong>extracted folder</strong> containing the extension files (where the <code>manifest.json</code> is located).
          </p>
          <p className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
            <ShieldCheck className="h-4 w-4" />
            Done! The ScamSentry Shield icon will appear in your browser bar, instantly protecting you in real time.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-16 sm:py-24 relative overflow-hidden">
      {/* Background radial amber blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Heading */}
        <div className="space-y-4 mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
              Developer Mode Installation
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Install ScamSentry Shield
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Because ScamSentry is open-source and respects user sovereignty, we choose not to pay the corporate Web Store registration fees. Follow these simple steps to install the browser shield manually.
          </p>
        </div>

        {/* Installation Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Steps List */}
          <div className="md:col-span-5 space-y-3">
            {steps.map((step) => {
              const isActive = activeStep === step.id;
              const isPassed = activeStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-4 ${
                    isActive
                      ? "bg-card border-primary/40 shadow-lg shadow-primary/5"
                      : isPassed
                      ? "bg-muted/10 border-border/60 hover:border-muted-foreground/35"
                      : "bg-transparent border-transparent hover:bg-muted/10"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : isPassed
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-muted/30 text-muted-foreground border-border"
                    }`}
                  >
                    {isPassed ? <ShieldCheck className="h-4 w-4" /> : step.icon}
                  </div>
                  <div className="space-y-1">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wider font-mono ${
                        isActive ? "text-primary" : "text-muted-foreground/60"
                      }`}
                    >
                      Step {step.id}
                    </p>
                    <p className="text-sm font-bold text-white leading-tight">
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-normal line-clamp-1">
                      {step.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Panel */}
          <div className="md:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 min-h-[340px] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-primary select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
              {steps[activeStep - 1].icon}
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                  Detailed Instructions
                </span>
                <h3 className="text-2xl font-bold text-white tracking-tight pt-2">
                  {steps[activeStep - 1].title}
                </h3>
              </div>

              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                {steps[activeStep - 1].detailedDesc}
              </div>
            </div>

            <div className="pt-8 border-t border-border flex items-center justify-between gap-4 mt-6">
              <button
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
                className="px-4 py-2 border border-border hover:bg-muted/30 text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Previous Step
              </button>

              {activeStep < 4 ? (
                <button
                  onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-primary/15 flex items-center gap-1.5"
                >
                  Next Step
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link
                  href="/validator"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/15"
                >
                  Scan a Link &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 border-t border-border pt-16 space-y-10">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </h2>

          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Why sideload instead of using the Web Store?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Google charges developers to register and upload extensions to the Web Store. Sideloading via Developer Mode allows ScamSentry to remain 100% free and open-source, bypassing store limits and avoiding any financial entry barriers.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Is it safe to enable Developer Mode?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Absolutely. Enabling Developer Mode simply lets you run extensions directly from source directories. ScamSentry runs entirely inside your sandbox and does not transmit your browsing history or private credentials.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">How do I update the extension?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To update, download the latest <code>ScamSentry-Extension.zip</code> from this page, extract and replace the files inside your installation folder, then click the refresh icon <RefreshCw className="h-3 w-3 inline" /> on the <code>chrome://extensions</code> page.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Does this work on mobile browsers?</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chrome on mobile does not support extensions. However, on Android you can install browsers like Kiwibrowser or Yandex Browser that support Chromium extensions and sideload ScamSentry using the exact same steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
