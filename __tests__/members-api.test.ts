import { DatabaseService } from '../lib/database';

// Mock the database service
jest.mock('../lib/database', () => ({
  DatabaseService: {
    getMembers: jest.fn(),
    createMember: jest.fn(),
    updateMember: jest.fn(),
    deleteMember: jest.fn(),
    getMemberById: jest.fn(),
    bulkUpdateMembers: jest.fn(),
    getFamilies: jest.fn(),
  },
}));

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe('Members API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/members', () => {
    it('should return all members', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          date_of_birth: '1990-01-01',
          baptism_date: '2010-01-01',
          join_date: '2020-01-01',
          member_status: 'active' as const,
          department: 'Worship',
          profile_image: 'profile1.jpg',
          gender: 'male',
          marital_status: 'married',
          occupation: 'Engineer',
          emergency_contact: 'Jane Doe',
          notes: 'Active member',
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
          tags: ['leader', 'worship'],
        },
        {
          id: 'member-2',
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+1234567891',
          address: '456 Oak Ave',
          date_of_birth: '1985-05-15',
          baptism_date: null,
          join_date: '2021-03-15',
          member_status: 'active' as const,
          department: 'Children',
          profile_image: 'profile2.jpg',
          gender: 'female',
          marital_status: 'single',
          occupation: 'Teacher',
          emergency_contact: 'John Smith',
          notes: 'Children ministry leader',
          created_at: '2021-03-15T00:00:00Z',
          updated_at: '2021-03-15T00:00:00Z',
          tags: ['children', 'volunteer'],
        },
      ];

      mockDatabaseService.getMembers.mockResolvedValue(mockMembers);

      // Mock the API route
      const { GET } = await import('../app/api/members/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMembers);
      expect(mockDatabaseService.getMembers).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockDatabaseService.getMembers.mockRejectedValue(new Error('Database error'));

      const { GET } = await import('../app/api/members/route');
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch members');
    });
  });

  describe('POST /api/members', () => {
    it('should create a new member', async () => {
      const memberData = {
        first_name: 'New',
        last_name: 'Member',
        email: 'new.member@example.com',
        phone: '+1234567892',
        address: '789 Pine St',
        date_of_birth: '1995-08-20',
        baptism_date: '2015-06-10',
        join_date: '2023-01-15',
        member_status: 'active' as const,
        department: 'Youth',
        gender: 'male',
        marital_status: 'single',
        occupation: 'Student',
        emergency_contact: 'Parent Member',
        notes: 'New youth member',
      };

      const mockCreatedMember = {
        id: 'member-3',
        ...memberData,
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z',
        tags: [],
      };

      mockDatabaseService.createMember.mockResolvedValue(mockCreatedMember);

      // Mock authentication and authorization
      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      jest.doMock('../lib/supabase-client', () => ({
        createServerClient: jest.fn().mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-1' } },
              error: null,
            }),
          },
        }),
      }));

      const { POST } = await import('../app/api/members/route');
      
      // Mock NextRequest
      const mockRequest = {
        json: jest.fn().mockResolvedValue(memberData),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockCreatedMember);
      expect(mockDatabaseService.createMember).toHaveBeenCalledWith({
        ...memberData,
        created_by: 'user-1',
      });
    });

    it('should handle authentication errors', async () => {
      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue(null),
      }));

      const { POST } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Not authenticated');
    });

    it('should handle authorization errors', async () => {
      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('member'),
      }));

      const { POST } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden: Insufficient permissions');
    });

    it('should handle creation errors', async () => {
      mockDatabaseService.createMember.mockRejectedValue(new Error('Database error'));

      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      jest.doMock('../lib/supabase-client', () => ({
        createServerClient: jest.fn().mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-1' } },
              error: null,
            }),
          },
        }),
      }));

      const { POST } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ first_name: 'Test' }),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create member');
    });
  });

  describe('PUT /api/members', () => {
    it('should update an existing member', async () => {
      const memberData = {
        id: 'member-1',
        first_name: 'Updated',
        last_name: 'Member',
        email: 'updated.member@example.com',
        department: 'Worship',
        member_status: 'active' as const,
      };

      const mockUpdatedMember = {
        ...memberData,
        phone: '+1234567890',
        address: '123 Main St',
        date_of_birth: '1990-01-01',
        baptism_date: '2010-01-01',
        join_date: '2020-01-01',
        profile_image: 'profile1.jpg',
        gender: 'male',
        marital_status: 'married',
        occupation: 'Engineer',
        emergency_contact: 'Jane Doe',
        notes: 'Active member',
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z',
        tags: ['leader', 'worship'],
      };

      mockDatabaseService.updateMember.mockResolvedValue(mockUpdatedMember);

      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      jest.doMock('../lib/supabase-client', () => ({
        createServerClient: jest.fn().mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-1' } },
              error: null,
            }),
          },
        }),
      }));

      const { PUT } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue(memberData),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUpdatedMember);
      expect(mockDatabaseService.updateMember).toHaveBeenCalledWith('member-1', {
        first_name: 'Updated',
        last_name: 'Member',
        email: 'updated.member@example.com',
        department: 'Worship',
        member_status: 'active',
      });
    });

    it('should return 400 when member ID is missing', async () => {
      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      const { PUT } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ first_name: 'Test' }),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Member ID is required');
    });

    it('should handle update errors', async () => {
      mockDatabaseService.updateMember.mockRejectedValue(new Error('Database error'));

      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      jest.doMock('../lib/supabase-client', () => ({
        createServerClient: jest.fn().mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-1' } },
              error: null,
            }),
          },
        }),
      }));

      const { PUT } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ id: 'member-1', first_name: 'Test' }),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await PUT(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update member');
    });
  });

  describe('DELETE /api/members', () => {
    it('should delete a member', async () => {
      mockDatabaseService.deleteMember.mockResolvedValue(undefined);

      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      jest.doMock('../lib/supabase-client', () => ({
        createServerClient: jest.fn().mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-1' } },
              error: null,
            }),
          },
        }),
      }));

      const { DELETE } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ id: 'member-1' }),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDatabaseService.deleteMember).toHaveBeenCalledWith('member-1');
    });

    it('should return 400 when member ID is missing', async () => {
      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      const { DELETE } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Member ID is required');
    });

    it('should handle deletion errors', async () => {
      mockDatabaseService.deleteMember.mockRejectedValue(new Error('Database error'));

      jest.doMock('../lib/auth-helpers', () => ({
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
        getUserRoleFromRequest: jest.fn().mockResolvedValue('admin'),
      }));

      jest.doMock('../lib/supabase-client', () => ({
        createServerClient: jest.fn().mockReturnValue({
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-1' } },
              error: null,
            }),
          },
        }),
      }));

      const { DELETE } = await import('../app/api/members/route');
      
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ id: 'member-1' }),
        headers: {
          get: jest.fn().mockReturnValue('Bearer mock-token'),
        },
      } as any;

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete member');
    });
  });
}); 