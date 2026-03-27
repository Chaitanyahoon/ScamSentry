#!/usr/bin/env node

/**
 * ScamSentry CLI - Batch URL Scanner
 *
 * Usage:
 *   npm run scan batch.csv
 *   npm run scan urls.json --format json
 *   npm run scan urls.txt --output results.html --format html
 *
 * Features:
 *   - Import from CSV, JSON, TXT files
 *   - Output as JSON, CSV, or HTML
 *   - Batch processing with progress tracking
 *   - Rate limit aware
 *   - Detailed threat analysis
 */

import fs from 'fs'
import path from 'path'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { analyzeHeuristics } from '../src/lib/validator/heuristics'
import { analyzeDomainForensics } from '../src/lib/validator/forensics'
import { analyzeThreatIntel } from '../src/lib/validator/threat-intel'
import { analyzeInternalGraph } from '../src/lib/validator/internal-graph'

interface ScanResult {
  url: string
  status: 'success' | 'error'
  finalScore?: number
  riskLevel?: string
  trustScore?: number
  timestamp: string
  errors?: string[]
  layers?: {
    heuristics: { score: number; flags: string[] }
    forensics: { score: number; flags: string[] }
    threatIntel: { score: number; flags: string[] }
    internalGraph: { score: number; flags: string[] }
  }
}

interface CLIOptions {
  input: string
  output?: string
  format: 'json' | 'csv' | 'html'
  batchSize: number
  verbose: boolean
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    printUsage()
    process.exit(1)
  }

  const input = args[0]
  let output: string | undefined
  let format: 'json' | 'csv' | 'html' = 'json'
  let batchSize = 10
  let verbose = false

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && i + 1 < args.length) {
      output = args[++i]
    } else if (args[i] === '--format' && i + 1 < args.length) {
      const f = args[++i]
      if (['json', 'csv', 'html'].includes(f)) {
        format = f as 'json' | 'csv' | 'html'
      }
    } else if (args[i] === '--batch-size' && i + 1 < args.length) {
      batchSize = parseInt(args[++i])
    } else if (args[i] === '--verbose') {
      verbose = true
    }
  }

  return { input, output, format, batchSize, verbose }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
ScamSentry CLI - Batch URL Scanner

Usage:
  npm run scan <input-file> [OPTIONS]

Input Formats:
  - CSV:  url,category (one URL per line or CSV with headers)
  - JSON: array of URLs or array of {url, category} objects
  - TXT:  one URL per line

Options:
  --output <file>     Output file path (default: results.<format>)
  --format <format>   Output format: json, csv, html (default: json)
  --batch-size <n>    URLs to process per batch (default: 10)
  --verbose          Show detailed progress

Examples:
  npm run scan urls.csv
  npm run scan urls.json --format html --output results.html
  npm run scan domains.txt --format csv --batch-size 20 --verbose
`)
}

/**
 * Load URLs from input file
 */
async function loadUrls(filePath: string): Promise<string[]> {
  const ext = path.extname(filePath).toLowerCase()
  const content = fs.readFileSync(filePath, 'utf-8')

  if (ext === '.csv') {
    const lines = content.split('\n').filter((l) => l.trim())
    // Skip header if it contains 'url' or 'URL'
    const hasHeader = lines[0]?.toLowerCase().includes('url')
    const dataLines = hasHeader ? lines.slice(1) : lines
    return dataLines.map((line) => {
      const [url] = line.split(',')
      return url.trim()
    })
  } else if (ext === '.json') {
    const data = JSON.parse(content)
    return Array.isArray(data)
      ? data.map((item) => (typeof item === 'string' ? item : item.url))
      : []
  } else if (ext === '.txt') {
    return content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
  }

  throw new Error(`Unsupported file format: ${ext}`)
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Scan a single URL through all 4 layers
 */
async function scanUrl(url: string): Promise<ScanResult> {
  const startTime = Date.now()

  try {
    if (!isValidUrl(url)) {
      return {
        url,
        status: 'error',
        timestamp: new Date().toISOString(),
        errors: ['Invalid URL format'],
      }
    }

    // Execute layers
    const layer1 = analyzeHeuristics(url)
    const layer2 = await analyzeDomainForensics(url)
    const layer3 = await analyzeThreatIntel([url])
    const layer4 = await analyzeInternalGraph(url)

    // Aggregate scores (additive, capped at 100)
    const finalScore = Math.min(
      layer1.score + layer2.score + layer3.score + layer4.score,
      100
    )

    // Classification
    const riskLevel =
      finalScore <= 30 ? 'Critical Threat' : finalScore <= 70 ? 'Suspicious' : 'Secure'
    const trustScore = 100 - finalScore
    const duration = Date.now() - startTime

    return {
      url,
      status: 'success',
      finalScore,
      riskLevel,
      trustScore,
      timestamp: new Date().toISOString(),
      layers: {
        heuristics: { score: layer1.score, flags: layer1.flags },
        forensics: { score: layer2.score, flags: layer2.flags },
        threatIntel: { score: layer3.score, flags: layer3.flags },
        internalGraph: { score: layer4.score, flags: layer4.flags },
      },
    }
  } catch (error) {
    return {
      url,
      status: 'error',
      timestamp: new Date().toISOString(),
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/**
 * Process URLs in batches with progress tracking
 */
async function scanBatch(urls: string[], batchSize: number, verbose: boolean): Promise<ScanResult[]> {
  const results: ScanResult[] = []
  const totalBatches = Math.ceil(urls.length / batchSize)

  console.log(`\n📊 Scanning ${urls.length} URLs in ${totalBatches} batches...`)
  const progressBar = createProgressBar(urls.length)

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1

    if (verbose) {
      console.log(`\n  [Batch ${batchNum}/${totalBatches}] Processing ${batch.length} URLs...`)
    }

    // Process batch in parallel with slight delay to respect any rate limits
    const batchResults = await Promise.all(batch.map((url) => scanUrl(url)))
    results.push(...batchResults)

    // Update progress bar
    const scanned = Math.min(i + batchSize, urls.length)
    progressBar(scanned)

    // Small delay between batches
    if (i + batchSize < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log('\n✅ Scan complete!')
  return results
}

/**
 * Simple progress bar
 */
function createProgressBar(total: number) {
  const barLength = 40

  return (current: number) => {
    const percentage = (current / total) * 100
    const filledBars = Math.round((percentage * barLength) / 100)
    const emptyBars = barLength - filledBars

    const bar =
      '[' + '█'.repeat(filledBars) + '░'.repeat(emptyBars) + ']' + percentage.toFixed(0) + '%'
    process.stdout.write('\r' + bar)
  }
}

/**
 * Export results as JSON
 */
function exportJson(results: ScanResult[], filePath: string) {
  const output = {
    metadata: {
      scannedAt: new Date().toISOString(),
      totalUrls: results.length,
      successCount: results.filter((r) => r.status === 'success').length,
      errorCount: results.filter((r) => r.status === 'error').length,
      threatCount: results.filter((r) => r.riskLevel && r.riskLevel !== 'Secure').length,
    },
    results,
  }

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2))
}

/**
 * Export results as CSV
 */
function exportCsv(results: ScanResult[], filePath: string) {
  const rows = [
    'URL,Status,Trust Score,Risk Level,Layer1 Score,Layer2 Score,Layer3 Score,Layer4 Score,Timestamp',
  ]

  results.forEach((r) => {
    const layers = r.layers
    const row = [
      `"${r.url}"`,
      r.status,
      r.trustScore ?? '',
      r.riskLevel ?? '',
      layers?.heuristics.score ?? '',
      layers?.forensics.score ?? '',
      layers?.threatIntel.score ?? '',
      layers?.internalGraph.score ?? '',
      r.timestamp,
    ].join(',')
    rows.push(row)
  })

  fs.writeFileSync(filePath, rows.join('\n'))
}

/**
 * Export results as HTML report
 */
function exportHtml(results: ScanResult[], filePath: string) {
  const threatCount = results.filter(
    (r) => r.riskLevel && r.riskLevel !== 'Secure'
  ).length
  const safeCount = results.filter((r) => r.riskLevel === 'Secure').length
  const errorCount = results.filter((r) => r.status === 'error').length

  const rows = results
    .map(
      (r) => `
    <tr>
      <td>${r.url}</td>
      <td>${r.status}</td>
      <td>${r.trustScore ?? '-'}</td>
      <td><span class="badge badge-${r.riskLevel?.toLowerCase().replace(' ', '-')}">${r.riskLevel ?? 'N/A'}</span></td>
      <td>${r.layers?.heuristics.score ?? '-'}</td>
      <td>${r.layers?.forensics.score ?? '-'}</td>
      <td>${r.layers?.threatIntel.score ?? '-'}</td>
      <td>${r.layers?.internalGraph.score ?? '-'}</td>
    </tr>
  `
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ScamSentry Scan Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; background: #f5f5f5; margin: 20px; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { color: #666; font-size: 12px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-secure { background: #d4edda; color: #155724; }
    .badge-suspicious { background: #fff3cd; color: #856404; }
    .badge-critical-threat { background: #f8d7da; color: #721c24; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 ScamSentry Scan Report</h1>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${results.length}</div>
        <div class="stat-label">Total URLs</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #28a745;">${safeCount}</div>
        <div class="stat-label">Secure</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #ffc107;">${results.filter((r) => r.riskLevel === 'Suspicious').length}</div>
        <div class="stat-label">Suspicious</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #dc3545;">${threatCount}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" style="color: #999;">${errorCount}</div>
        <div class="stat-label">Errors</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Status</th>
          <th>Trust Score</th>
          <th>Risk Level</th>
          <th>L1</th>
          <th>L2</th>
          <th>L3</th>
          <th>L4</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>ScamSentry v1.0.0 | Deterministic URL Threat Detection</p>
    </div>
  </div>
</body>
</html>
  `

  fs.writeFileSync(filePath, html)
}

/**
 * Main CLI entry point
 */
async function main() {
  try {
    const opts = parseArgs()

    // Check file exists
    if (!fs.existsSync(opts.input)) {
      console.error(`❌ File not found: ${opts.input}`)
      process.exit(1)
    }

    // Load URLs
    console.log(`📂 Loading URLs from ${opts.input}...`)
    const urls = await loadUrls(opts.input)

    if (urls.length === 0) {
      console.error('❌ No URLs found in input file')
      process.exit(1)
    }

    console.log(`✓ Loaded ${urls.length} URLs`)

    // Scan URLs
    const results = await scanBatch(urls, opts.batchSize, opts.verbose)

    // Generate output
    const outputFile = opts.output || `results.${opts.format}`

    console.log(`\n💾 Exporting results as ${opts.format}...`)

    if (opts.format === 'json') {
      exportJson(results, outputFile)
    } else if (opts.format === 'csv') {
      exportCsv(results, outputFile)
    } else if (opts.format === 'html') {
      exportHtml(results, outputFile)
    }

    console.log(`✅ Results saved to ${outputFile}`)

    // Print summary
    const success = results.filter((r) => r.status === 'success').length
    const threats = results.filter((r) => r.status === 'success' && r.riskLevel !== 'Secure')

    console.log(`\n📊 Summary:`)
    console.log(`  • Total URLs: ${results.length}`)
    console.log(`  • Successful: ${success}`)
    console.log(`  • Threats Detected: ${threats.length}`)
    console.log(`  • Errors: ${results.filter((r) => r.status === 'error').length}`)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
