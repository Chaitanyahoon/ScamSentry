# ScamSentry CLI - Batch URL Scanner

Command-line tool for scanning large batches of URLs against the ScamSentry deterministic threat detection pipeline.

## Features

- 🚀 **Batch Processing**: Scan hundreds of URLs with progress tracking
- 📊 **Multiple Output Formats**: JSON, CSV, or beautiful HTML reports
- 📁 **Flexible Input**: CSV, JSON, or plain text files
- ⚡ **Optimized**: Batch processing with configurable batch sizes
- 📈 **Detailed Reports**: Full layer-by-layer analysis for each URL

## Installation

```bash
# Install TypeScript runner (one-time)
npm install --save-dev ts-node

# Or use with Node.js (after building TypeScript)
npm run build
```

## Usage

### Basic Usage

```bash
# Scan URLs from CSV file
npm run scan urls.csv

# Scan URLs from JSON file
npm run scan urls.json

# Scan URLs from text file (one URL per line)
npm run scan urls.txt
```

### With Options

```bash
# Export as HTML report
npm run scan urls.csv --format html --output report.html

# Export as CSV with custom batch size
npm run scan urls.csv --format csv --batch-size 20

# Verbose output with progress details
npm run scan urls.csv --format json --verbose
```

## Input Formats

### CSV Format

```csv
url,category
https://example.com,legitimate
https://suspicious.xyz,phishing
```

Or without headers (one URL per line):

```
https://example.com
https://suspicious.xyz
https://google.com
```

### JSON Format

Array of URLs:

```json
[
  "https://example.com",
  "https://suspicious.xyz",
  "https://google.com"
]
```

Array of objects:

```json
[
  {"url": "https://example.com", "category": "legitimate"},
  {"url": "https://suspicious.xyz", "category": "phishing"}
]
```

### Text Format

One URL per line:

```
https://example.com
https://suspicious.xyz
https://google.com
```

## Output Formats

### JSON Output

```json
{
  "metadata": {
    "scannedAt": "2026-03-27T10:30:00Z",
    "totalUrls": 10,
    "successCount": 9,
    "errorCount": 1,
    "threatCount": 3
  },
  "results": [
    {
      "url": "https://example.com",
      "status": "success",
      "finalScore": 15,
      "riskLevel": "Secure",
      "trustScore": 85,
      "timestamp": "2026-03-27T10:30:00Z",
      "layers": {
        "heuristics": {"score": 5, "flags": []},
        "forensics": {"score": 5, "flags": []},
        "threatIntel": {"score": 0, "flags": []},
        "internalGraph": {"score": 0, "flags": []}
      }
    }
  ]
}
```

### CSV Output

```csv
URL,Status,Trust Score,Risk Level,Layer1 Score,Layer2 Score,Layer3 Score,Layer4 Score,Timestamp
"https://example.com",success,85,Secure,5,5,0,0,2026-03-27T10:30:00Z
"https://phishing.xyz",success,25,Critical Threat,50,25,10,0,2026-03-27T10:30:01Z
```

### HTML Output

Interactive HTML report with:
- Summary statistics (Total, Secure, Suspicious, Critical, Errors)
- Color-coded risk levels
- Detailed per-layer scores
- Sortable results table
- Print-friendly design

## Examples

### Example 1: Scan CSV file and export as HTML

```bash
npm run scan domains.csv --format html --output report.html
```

### Example 2: Batch process with custom settings

```bash
npm run scan massive-list.json --format json --batch-size 50 --output scan-results.json --verbose
```

### Example 3: Create a quick CSV scan report

```bash
npm run scan urls.txt --format csv --batch-size 25
```

Results saved to `results.csv`

### Example 4: Verbose scanning with progress

```bash
npm run scan phishing-urls.json --verbose
```

Output:

```
📂 Loading URLs from phishing-urls.json...
✓ Loaded 100 URLs

📊 Scanning 100 URLs in 10 batches...
  [Batch 1/10] Processing 10 URLs...
  [Batch 2/10] Processing 10 URLs...
  ...
✅ Scan complete!

💾 Exporting results as json...
✅ Results saved to results.json

📊 Summary:
  • Total URLs: 100
  • Successful: 99
  • Threats Detected: 42
  • Errors: 1
```

## Test Data

Try the included example files:

```bash
# CSV example
npm run scan examples/scanner-example.csv --format html

# JSON example
npm run scan examples/scanner-example.json --format csv
```

## Output Files

By default, results are saved to:
- `results.json` (if using `--format json`)
- `results.csv` (if using `--format csv`)
- `results.html` (if using `--format html`)

Specify custom output file with `--output`:

```bash
npm run scan urls.csv --output my-scan-report.html --format html
```

## Performance

- **Processing Speed**: ~50-100 URLs per second (depending on layer speed)
- **Memory Usage**: ~50-100MB for 1000 URLs
- **Batch Size Recommendation**: 10-50 URLs per batch

For large lists (1000+ URLs):
- Use `--batch-size 50` for better performance
- Consider splitting into multiple files
- Run during off-peak hours to respect rate limits

## Exit Codes

- `0` - Success
- `1` - File not found or invalid
- `1` - Wrong format or processing error

## Tips

1. **Large Batches**: For 10,000+ URLs, split into multiple files and run separately
2. **Production Use**: Store output reports for compliance/audit trails
3. **HTML Reports**: Share with non-technical stakeholders
4. **CSV Data**: Import into spreadsheets or BI tools
5. **JSON**: Integrate with automated workflows

## Architecture

The CLI leverages the same 4-layer detection pipeline as the web API:

1. **Layer 1 (Heuristics)**: 60+ pattern matching rules
2. **Layer 2 (Forensics)**: Domain infrastructure analysis
3. **Layer 3 (Threat Intel)**: External threat databases (optional)
4. **Layer 4 (Internal Graph)**: Community threat database

Each layer contributes independently to the final risk score.

## Troubleshooting

### Error: File not found
```
❌ File not found: urls.csv
```
Check the file path and ensure it exists in the current directory.

### Error: Invalid URL format
Some URLs in the input file are malformed. The CLI will return an error status for those specific URLs but continue processing.

### Slow Processing
- Reduce batch size with `--batch-size 5` for faster feedback
- Disable verbose mode (`--verbose` slows down output)
- Ensure sufficient system memory

### Memory Issues
- Process in smaller batches
- Split large files (1000+ URLs each)
- Use `--batch-size 5-10` for memory-constrained systems

## Future Enhancements

- [ ] Database export (PostgreSQL, MongoDB)
- [ ] Webhook integration for async results
- [ ] Parallel layer processing
- [ ] Rate limit awareness
- [ ] Resumable batch processing
- [ ] Real-time dashboard
- [ ] Export to SIEM systems

## Support

For issues or feature requests:
- GitHub: [github.com/Chaitanyahoon/ScamSentry](https://github.com/Chaitanyahoon/ScamSentry)
- Issues: [github.com/Chaitanyahoon/ScamSentry/issues](https://github.com/Chaitanyahoon/ScamSentry/issues)

## License

MIT License - See LICENSE file for details
