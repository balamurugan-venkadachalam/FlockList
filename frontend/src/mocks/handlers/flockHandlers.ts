import { http, HttpResponse, delay } from 'msw';

// Base URL for API endpoints
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API endpoints based on OpenAPI spec
const ENDPOINTS = {
  FLOCKS: `${baseUrl}/api/flocks`,
  FLOCK_BY_ID: `${baseUrl}/api/flocks/:id`,
  FLOCK_INVITATIONS: `${baseUrl}/api/flocks/invitations`,
  FLOCK_ACCEPT_INVITATION: `${baseUrl}/api/flocks/accept-invitation`,
};

// Mock flocks data
const mockFlocks = [
  {
    _id: 'flock1',
    name: 'Development Team',
    createdBy: 'user2',
    members: [
      { 
        _id: 'member1',
        user: {
          _id: 'user1', 
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        role: 'member',
        joinedAt: '2023-10-01T00:00:00.000Z'
      },
      { 
        _id: 'member2',
        user: {
          _id: 'user2', 
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        },
        role: 'admin',
        joinedAt: '2023-10-01T00:00:00.000Z'
      },
      { 
        _id: 'member3',
        user: {
          _id: 'user3', 
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com'
        },
        role: 'member',
        joinedAt: '2023-10-01T00:00:00.000Z'
      }
    ],
    pendingInvitations: [
      {
        email: 'pending@example.com',
        role: 'member',
        invitedAt: '2023-11-01T00:00:00.000Z'
      }
    ],
    createdAt: '2023-10-01T00:00:00.000Z',
    updatedAt: '2023-10-01T00:00:00.000Z'
  },
  {
    _id: 'flock2',
    name: 'Marketing Team',
    createdBy: 'user1',
    members: [
      { 
        _id: 'member4',
        user: {
          _id: 'user1', 
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        role: 'admin',
        joinedAt: '2023-10-15T00:00:00.000Z'
      },
      { 
        _id: 'member5',
        user: {
          _id: 'user3', 
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com'
        },
        role: 'member',
        joinedAt: '2023-10-15T00:00:00.000Z'
      }
    ],
    pendingInvitations: [],
    createdAt: '2023-10-15T00:00:00.000Z',
    updatedAt: '2023-10-15T00:00:00.000Z'
  }
];

// Mock invitations data
const mockInvitations = [
  {
    _id: 'inv1',
    flockId: 'flock3',
    flockName: 'Design Team',
    invitedBy: {
      _id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    },
    invitedEmail: 'john@example.com',
    status: 'pending',
    token: 'invitation-token-1',
    createdAt: '2023-11-20T00:00:00.000Z',
    expiresAt: '2023-12-20T00:00:00.000Z'
  },
  {
    _id: 'inv2',
    flockId: 'flock4',
    flockName: 'QA Team',
    invitedBy: {
      _id: 'user3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com'
    },
    invitedEmail: 'john@example.com',
    status: 'pending',
    token: 'invitation-token-2',
    createdAt: '2023-11-25T00:00:00.000Z',
    expiresAt: '2023-12-25T00:00:00.000Z'
  }
];

// Flock handlers based on OpenAPI spec
export const flockHandlers = [
  // POST /api/flocks - Create flock
  http.post(ENDPOINTS.FLOCKS, async ({ request }) => {
    await delay(500);
    const body = await request.json() as { name: string };
    
    if (!body?.name) {
      return HttpResponse.json(
        { message: 'Flock name is required' },
        { status: 400 }
      );
    }
    
    const newFlock = {
      _id: `flock${mockFlocks.length + 1}`,
      name: body.name,
      createdBy: {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      members: [
        { 
          _id: 'user1', 
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'admin' 
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(
      newFlock,
      { status: 201 }
    );
  }),
  
  // GET /api/flocks - Get user flocks
  http.get(ENDPOINTS.FLOCKS, async () => {
    await delay(300);
    
    return HttpResponse.json(
      mockFlocks,
      { status: 200 }
    );
  }),
  
  // GET /api/flocks/invitations - Get user invitations
  http.get(ENDPOINTS.FLOCK_INVITATIONS, async () => {
    await delay(300);
    
    return HttpResponse.json(
      mockInvitations,
      { status: 200 }
    );
  }),
  
  // POST /api/flocks/accept-invitation - Accept flock invitation
  http.post(ENDPOINTS.FLOCK_ACCEPT_INVITATION, async ({ request }) => {
    await delay(400);
    const body = await request.json() as { token: string };
    
    if (!body?.token) {
      return HttpResponse.json(
        { message: 'Invitation token is required' },
        { status: 400 }
      );
    }
    
    const invitation = mockInvitations.find(inv => inv.token === body.token);
    
    if (!invitation) {
      return HttpResponse.json(
        { message: 'Invitation not found or expired' },
        { status: 404 }
      );
    }
    
    // Create a mock flock for the accepted invitation
    const acceptedFlock = {
      _id: invitation.flockId,
      name: invitation.flockName,
      createdBy: invitation.invitedBy,
      members: [
        { 
          _id: invitation.invitedBy._id, 
          firstName: invitation.invitedBy.firstName,
          lastName: invitation.invitedBy.lastName,
          email: invitation.invitedBy.email,
          role: 'admin' 
        },
        { 
          _id: 'user1', 
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'member' 
        }
      ],
      createdAt: '2023-11-01T00:00:00.000Z',
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(
      acceptedFlock,
      { status: 200 }
    );
  }),
  
  // GET /api/flocks/:id - Get flock by ID
  http.get(ENDPOINTS.FLOCK_BY_ID, async ({ params }) => {
    console.log('MSW: GET /api/flocks/:id called with params:', params);
    await delay(300);
    // For Storybook, always return the first flock regardless of ID
    // This ensures we always have data to display
    const flock = mockFlocks[0];
    
    console.log('MSW: Returning flock:', flock);
    return HttpResponse.json(
      {
        message: 'Flock retrieved successfully',
        flock: flock
      },
      { status: 200 }
    );
  })
];

// Special handlers for different story scenarios
export const flocksEmptyHandler = http.get(ENDPOINTS.FLOCKS, async () => {
  await delay(300);
  
  return HttpResponse.json(
    [],
    { status: 200 }
  );
});

export const flocksErrorHandler = http.get(ENDPOINTS.FLOCKS, async () => {
  await delay(300);
  
  return HttpResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
});

// Loading handlers
export const flockLoadingHandler = http.get(`${baseUrl}/api/flocks/:id`, async () => {
  // Never resolve to simulate loading
  await delay('infinite');
  return new Response(null, { status: 200 });
});

export const flockNotFoundHandler = http.get(ENDPOINTS.FLOCK_BY_ID, async ({ params }) => {
  await delay(300);
  
  return HttpResponse.json(
    { 
      message: `Flock with ID ${params.id} not found`,
      flock: null 
    },
    { status: 404 }
  );
});

export const flockDetailErrorHandler = http.get(ENDPOINTS.FLOCK_BY_ID, async () => {
  await delay(300);
  
  return HttpResponse.json(
    { 
      message: 'Internal server error',
      flock: null
    },
    { status: 500 }
  );
});
