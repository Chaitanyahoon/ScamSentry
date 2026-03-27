import '@testing-library/jest-dom'

// Polyfill fetch for Node.js environment
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true,
      status: 200,
    })
  )
}

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []), // Return empty array by default
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(async () => ({ id: 'mock-id' })),
  getDocs: jest.fn(async () => ({ docs: [] })),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: jest.fn(() => new Date()) })),
    fromDate: jest.fn((date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
    })),
  },
}))

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}))

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
}))

// Mock Upstash
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn(() => ({
    limit: jest.fn(async () => ({ success: true, limit: 100, remaining: 99 })),
  })),
}))

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(() => ({
    incr: jest.fn(async () => 1),
    expire: jest.fn(async () => 1),
    get: jest.fn(async () => null),
  })),
}))

