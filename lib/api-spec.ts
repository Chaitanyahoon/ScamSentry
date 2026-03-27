/**
 * OpenAPI 3.0 Specification for ScamSentry URL Validator API
 * Generated: 2026-03-27
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ScamSentry URL Validator API',
    version: '1.0.0',
    description: 'Deterministic 4-layer URL threat detection and validation system',
    contact: {
      name: 'ScamSentry Team',
      url: 'https://github.com/Chaitanyahoon/ScamSentry',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'https://scam-sentry.vercel.app',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development',
    },
  ],
  paths: {
    '/api/validator': {
      post: {
        tags: ['UI Endpoint'],
        summary: 'UI URL Scanner',
        description: 'Scan a single URL and get detailed forensic analysis (No authentication required)',
        operationId: 'validateURL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL to validate',
                    example: 'https://example.com',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Scan completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    finalScore: {
                      type: 'number',
                      minimum: 0,
                      maximum: 100,
                      description: 'Final risk score (0=safe, 100=critical)',
                      example: 45,
                    },
                    riskLevel: {
                      type: 'string',
                      enum: ['Secure', 'Suspicious', 'Critical Threat'],
                      example: 'Suspicious',
                    },
                    forensicReport: {
                      type: 'object',
                      properties: {
                        layer1_Heuristics: {
                          $ref: '#/components/schemas/LayerReport',
                        },
                        layer2_Forensics: {
                          $ref: '#/components/schemas/LayerReport',
                        },
                        layer3_ThreatIntel: {
                          $ref: '#/components/schemas/LayerReport',
                        },
                        layer4_InternalGraph: {
                          $ref: '#/components/schemas/LayerReport',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Invalid URL format',
                    },
                  },
                },
              },
            },
          },
          429: {
            description: 'Rate limit exceeded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                      example: 'Rate limit exceeded',
                    },
                    retryAfter: {
                      type: 'number',
                      description: 'Seconds until next request allowed',
                      example: 60,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/validate': {
      post: {
        tags: ['B2B API'],
        summary: 'B2B Bulk Validation API',
        description: 'Production-grade API for enterprise integrations with rate limiting',
        operationId: 'validateBulk',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['payload'],
                properties: {
                  payload: {
                    type: 'string',
                    description: 'URL to validate',
                    example: 'https://safe-example.com',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Validation successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        timestamp: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-03-27T10:30:00Z',
                        },
                        version: {
                          type: 'string',
                          example: '1.0.0',
                        },
                      },
                    },
                    data: {
                      type: 'object',
                      properties: {
                        target: {
                          type: 'string',
                          description: 'The URL that was analyzed',
                          example: 'https://safe-example.com',
                        },
                        isBlacklisted: {
                          type: 'boolean',
                          description: 'Whether URL is on internal blacklist',
                          example: false,
                        },
                        trustScore: {
                          type: 'number',
                          minimum: 0,
                          maximum: 100,
                          description: 'Trust score (inverse of risk)',
                          example: 85,
                        },
                        severity: {
                          type: 'string',
                          enum: ['low', 'medium', 'high'],
                          description: 'Severity classification',
                          example: 'low',
                        },
                        diagnostics: {
                          type: 'object',
                          properties: {
                            layers: {
                              type: 'object',
                              properties: {
                                heuristics: { $ref: '#/components/schemas/LayerDiagnostic' },
                                forensics: { $ref: '#/components/schemas/LayerDiagnostic' },
                                threatIntel: { $ref: '#/components/schemas/LayerDiagnostic' },
                                internalGraph: { $ref: '#/components/schemas/LayerDiagnostic' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized - Invalid or missing API key',
          },
          429: {
            description: 'Rate limit exceeded',
            headers: {
              'X-RateLimit-Limit': {
                schema: { type: 'integer' },
                description: 'Requests allowed per minute',
              },
              'X-RateLimit-Remaining': {
                schema: { type: 'integer' },
                description: 'Remaining requests this minute',
              },
              'X-RateLimit-Reset': {
                schema: { type: 'integer' },
                description: 'Unix timestamp when limit resets',
              },
            },
          },
        },
      },
    },

    '/api/v1/verify': {
      post: {
        tags: ['B2B API'],
        summary: 'Authenticated Verification',
        description: 'Secure endpoint for verified integrations with API key authentication',
        operationId: 'verifyURL',
        security: [{ ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    description: 'URL to verify',
                  },
                  webhookUrl: {
                    type: 'string',
                    format: 'uri',
                    description: 'Optional webhook for async results',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Verification successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    verification: {
                      type: 'object',
                      properties: {
                        isVerified: { type: 'boolean' },
                        threatLevel: { type: 'string', enum: ['safe', 'warning', 'dangerous'] },
                        confidence: { type: 'number', minimum: 0, maximum: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
  },

  components: {
    schemas: {
      LayerReport: {
        type: 'object',
        properties: {
          score: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Layer-specific risk score',
          },
          flags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Detected threat indicators',
            example: ['typosquatting', 'suspicious-tld', 'credential-harvesting'],
          },
        },
      },

      LayerDiagnostic: {
        type: 'object',
        properties: {
          triggered: {
            type: 'boolean',
            description: 'Whether this layer detected threats',
          },
          score: {
            type: 'number',
            description: 'Layer risk score',
          },
          details: {
            type: 'array',
            items: { type: 'string' },
            description: 'Detection details',
          },
        },
      },
    },

    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for B2B endpoints',
      },
    },
  },

  tags: [
    {
      name: 'UI Endpoint',
      description: 'Public endpoints for web interface (no auth required)',
    },
    {
      name: 'B2B API',
      description: 'Enterprise API endpoints (requires API key)',
    },
  ],
}

/**
 * Rate Limiting Tiers
 */
export const rateLimitTiers = {
  free: {
    requestsPerMinute: 5,
    requestsPerDay: 100,
    description: 'For individual developers',
  },
  pro: {
    requestsPerMinute: 60,
    requestsPerDay: 10000,
    description: 'For small teams',
  },
  enterprise: {
    requestsPerMinute: 300,
    requestsPerDay: 500000,
    description: 'For large-scale operations',
  },
}

/**
 * Error Response Codes
 */
export const errorCodes = {
  INVALID_URL: {
    code: 'INVALID_URL',
    status: 400,
    message: 'The provided URL is invalid or malformed',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'API key is missing or invalid',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429,
    message: 'Rate limit exceeded. Please try again later.',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'An internal server error occurred',
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    status: 503,
    message: 'Service temporarily unavailable',
  },
}

/**
 * Usage Examples
 */
export const usageExamples = {
  uiEndpoint: {
    title: 'UI Scanner - Check if URL is Safe',
    description: 'Make a POST request to scan a URL without authentication',
    curl: `curl -X POST https://scam-sentry.vercel.app/api/validator \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://suspicious-site.xyz"}'`,
    response: {
      success: true,
      finalScore: 75,
      riskLevel: 'Suspicious',
      forensicReport: {
        layer1_Heuristics: {
          score: 35,
          flags: ['typosquatting', 'suspicious-tld', 'credential-harvesting'],
        },
        layer2_Forensics: {
          score: 20,
          flags: ['young-domain', 'no-https'],
        },
        layer3_ThreatIntel: { score: 15, flags: ['google-malware-warning'] },
        layer4_InternalGraph: { score: 5, flags: ['reported-2-times'] },
      },
    },
  },

  b2bAPI: {
    title: 'B2B API - Enterprise Integration',
    description: 'Validate URLs with enterprise API key for higher rate limits',
    curl: `curl -X POST https://scam-sentry.vercel.app/api/v1/validate \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_prod_xxxxxxxxxxxxx" \\
  -d '{"payload":"https://example.com"}'`,
    response: {
      success: true,
      meta: { timestamp: '2026-03-27T10:30:00Z', version: '1.0.0' },
      data: {
        target: 'https://example.com',
        isBlacklisted: false,
        trustScore: 92,
        severity: 'low',
        diagnostics: {
          layers: {
            heuristics: { triggered: false, score: 5 },
            forensics: { triggered: false, score: 3 },
            threatIntel: { triggered: false, score: 0 },
            internalGraph: { triggered: false, score: 0 },
          },
        },
      },
    },
  },
}
