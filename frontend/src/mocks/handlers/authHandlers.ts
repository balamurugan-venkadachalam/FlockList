import { http, HttpResponse, delay } from 'msw';

// Base URL for API endpoints
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API endpoints based on OpenAPI spec
const ENDPOINTS = {
  REGISTER: `${baseUrl}/api/auth/register`,
  LOGIN: `${baseUrl}/api/auth/login`,
  LOGOUT: `${baseUrl}/api/auth/logout`,
  ME: `${baseUrl}/api/auth/me`,
  REFRESH_TOKEN: `${baseUrl}/api/auth/refresh-token`,
  GOOGLE_AUTH: `${baseUrl}/api/auth/google`,
  VERIFY_EMAIL: `${baseUrl}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${baseUrl}/api/auth/resend-verification`,
};

// Mock users data
const mockUsers = [
  {
    _id: 'user1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isEmailVerified: true,
    profilePicture: null
  },
  {
    _id: 'user2',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'admin',
    isEmailVerified: true,
    profilePicture: null
  },
  {
    _id: 'user3',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'user',
    isEmailVerified: false,
    profilePicture: null
  }
];

// Auth handlers based on OpenAPI spec
export const authHandlers = [
  // POST /api/auth/register - Register new user
  http.post(ENDPOINTS.REGISTER, async ({ request }) => {
    await delay(500);
    const body = await request.json() as { 
      email: string;
      firstName: string;
      lastName: string;
    };
    
    // Check if email already exists
    if (!body?.email || mockUsers.some(user => user.email === body.email)) {
      return HttpResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = {
      _id: `user${mockUsers.length + 1}`,
      email: body.email,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      role: 'user',
      isEmailVerified: false,
      profilePicture: null
    };
    
    return HttpResponse.json(
      {
        message: 'User registered successfully',
        user: newUser,
        token: 'mock-token-for-new-user'
      },
      { status: 201 }
    );
  }),
  
  // POST /api/auth/login - User login
  http.post(ENDPOINTS.LOGIN, async ({ request }) => {
    await delay(300);
    const body = await request.json() as { email: string; password: string };
    
    // Find user by email
    if (!body?.email) {
      return HttpResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    const user = mockUsers.find(u => u.email === body.email);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'Authentication failed - invalid credentials' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json(
      {
        message: 'Login successful',
        user,
        token: 'mock-token-for-existing-user'
      },
      { status: 200 }
    );
  }),
  
  // POST /api/auth/logout - User logout
  http.post(ENDPOINTS.LOGOUT, async () => {
    await delay(200);
    
    return HttpResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  }),
  
  // GET /api/auth/me - Get current user
  http.get(ENDPOINTS.ME, async ({ request }) => {
    await delay(200);
    
    // Check for auth header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Default to first user for simplicity
    const user = mockUsers[0];
    
    return HttpResponse.json(
      { user },
      { status: 200 }
    );
  }),
  
  // POST /api/auth/refresh-token - Refresh authentication token
  http.post(ENDPOINTS.REFRESH_TOKEN, async () => {
    await delay(200);
    
    return HttpResponse.json(
      {
        message: 'Token refreshed successfully',
        token: 'new-mock-token',
        user: mockUsers[0]
      },
      { status: 200 }
    );
  }),
  
  // POST /api/auth/google - Google authentication
  http.post(ENDPOINTS.GOOGLE_AUTH, async ({ request }) => {
    await delay(400);
    const body = await request.json() as { token: string };
    
    if (!body?.token) {
      return HttpResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json(
      {
        message: 'Authentication successful',
        user: mockUsers[0],
        token: 'mock-google-auth-token'
      },
      { status: 200 }
    );
  }),
  
  // GET /api/auth/verify-email - Verify email address
  http.get(ENDPOINTS.VERIFY_EMAIL, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return HttpResponse.json(
        { message: 'Invalid verification token' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(
      {
        message: 'Email verified successfully',
        user: {
          ...mockUsers[0],
          isEmailVerified: true
        }
      },
      { status: 200 }
    );
  }),
  
  // POST /api/auth/resend-verification - Resend verification email
  http.post(ENDPOINTS.RESEND_VERIFICATION, async ({ request }) => {
    await delay(300);
    const body = await request.json() as { email: string };
    
    if (!body?.email) {
      return HttpResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    const user = mockUsers.find(u => u.email === body.email);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(
      { message: 'Verification email resent successfully' },
      { status: 200 }
    );
  })
];

// Special handlers for different story scenarios
export const authErrorHandler = http.get(ENDPOINTS.ME, async () => {
  await delay(300);
  
  return HttpResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
});

export const authUnauthorizedHandler = http.get(ENDPOINTS.ME, async () => {
  await delay(300);
  
  return HttpResponse.json(
    { message: 'Not authenticated' },
    { status: 401 }
  );
});

export const authLoadingHandler = http.get(ENDPOINTS.ME, async () => {
  await delay('infinite');
  return new Response(null, { status: 200 });
});
