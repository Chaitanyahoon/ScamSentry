export const MALICIOUS_URLS = [
  // Typosquatting
  'http://paypa1.com/login',
  'http://amaozn.com/account',
  'http://googl-security.com/verify',

  // Credential harvesting
  'http://verify-account.xyz/password',
  'http://secure-login.top/verify-identity',
  'http://apple-verify.shop/auth/confirm-password',

  // Suspicious TLDs
  'http://bank-login.xyz',
  'http://confirm-paypal.top',
  'http://urgent-action.loan',

  // URL shorteners + phishing
  'http://bit.ly/7x3k2m9',
  'http://tinyurl.com/phishing123',

  // Free hosting
  'http://phishing-site.github.io/login',
  'http://fake-bank.vercel.app/auth',

  // Embedded redirects
  'http://trusted-site.com/redirect?url=http://malicious.xyz',

  // Homoglyph attacks
  'http://rn1cloud.com/auth',
  'http://0day-vuln.com',

  // Suspicious parameters
  'http://example.com?redirect=http://attacker.xyz&callback=http://malicious.top&token=12345678901234567890',

  // Fast-flux indicators (IP addresses)
  'http://192.168.1.1:8080/admin',
];

export const SAFE_URLS = [
  'https://github.com/login',
  'https://www.google.com/search',
  'https://www.apple.com',
  'https://stackoverflow.com/questions',
  'https://www.wikipedia.org',
  'https://www.amazon.com/gp/yourstore',
  'https://www.facebook.com',
  'https://www.youtube.com',
  'https://www.linkedin.com/feed',
  'https://www.twitter.com/home',
  'https://www.reddit.com',
  'https://www.bbc.com/news',
  'https://www.cnn.com',
  'https://www.microsoft.com',
  'https://www.ibm.com',
];

export const EDGE_CASE_URLS = [
  // Legitimate subdomains
  'https://mail.google.com',
  'https://drive.google.com',
  'https://accounts.google.com/login',

  // Legitimate short business domain
  'https://bit.io',

  // Legitimate use of common keywords
  'https://www.password-reset-guide.com',

  // Homophone typos that are legitimate
  'https://www.example-blog.com',

  // URLs with query parameters (legitimate)
  'https://www.amazon.com/s?k=laptop&ref=nb_sb_noss',

  // URLs with fragments
  'https://www.example.com#section',
];

export const CREDENTIAL_HARVESTING_URLS = [
  'https://verify-microsoft-account.xyz/password-reset',
  'https://confirm-apple-id.shop/auth',
  'https://validate-stripe-merchant.top/secret-key',
  'https://authenticate-github-user.loan/token',
  'https://reset-password-google.club/credentials',
];

export const HOMOGLYPH_URLS = [
  'http://googlc.com', // l=c swap
  'http://amaz0n.com', // o=0 swap
  'http://rni-cloud.com', // m=rn swap
  'http://tw1tter.com', // i=1 swap
];

export const DGA_URLS = [
  'http://xjkqwerty.xyz',
  'http://lfghtykop.top',
  'http://zxcvbnmasd.loan',
  'http://qwertyasdfgh.club',
];

export const LEGITIMATE_HIGH_ENTROPY_URLS = [
  // Authentication tokens are legitimate
  'https://example.com/auth?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'https://example.com/authorize?state=abc123def456ghi789jkl',
  'https://stripe.com/checkout?session=cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
];
