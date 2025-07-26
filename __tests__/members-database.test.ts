import { DatabaseService } from '../lib/database';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
};

jest.mock('@/lib/supabase-client', () => ({
  supabase: mockSupabase,
}));

describe('Members Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMembers', () => {
    it('should fetch all members with tags', async () => {
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
          member_status: 'active',
          department: 'Worship',
          profile_image: 'profile1.jpg',
          gender: 'male',
          marital_status: 'married',
          occupation: 'Engineer',
          emergency_contact: 'Jane Doe',
          notes: 'Active member',
          created_at: '2020-01-01T00:00:00Z',
          updated_at: '2020-01-01T00:00:00Z',
          member_tags: [
            { tag: 'leader' },
            { tag: 'worship' },
          ],
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
          member_status: 'active',
          department: 'Children',
          profile_image: 'profile2.jpg',
          gender: 'female',
          marital_status: 'single',
          occupation: 'Teacher',
          emergency_contact: 'John Smith',
          notes: 'Children ministry leader',
          created_at: '2021-03-15T00:00:00Z',
          updated_at: '2021-03-15T00:00:00Z',
          member_tags: [
            { tag: 'children' },
            { tag: 'volunteer' },
          ],
        },
      ];

      mockSupabase.single.mockResolvedValue({
        data: mockMembers,
        error: null,
      });

      const result = await DatabaseService.getMembers();

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        member_tags (
          tag
        )
      `);
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual([
        {
          ...mockMembers[0],
          tags: ['leader', 'worship'],
        },
        {
          ...mockMembers[1],
          tags: ['children', 'volunteer'],
        },
      ]);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await DatabaseService.getMembers();

      expect(result).toEqual([]);
    });
  });

  describe('createMember', () => {
    it('should create a new member with proper date handling', async () => {
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
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedMember,
        error: null,
      });

      const result = await DatabaseService.createMember(memberData);

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...memberData,
        join_date: '2023-01-15',
        member_status: 'active',
      });
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedMember);
    });

    it('should handle empty date strings by converting to null', async () => {
      const memberData = {
        first_name: 'Test',
        last_name: 'Member',
        date_of_birth: '',
        baptism_date: '',
        join_date: '',
        member_status: 'active' as const,
      };

      const mockCreatedMember = {
        id: 'member-4',
        first_name: 'Test',
        last_name: 'Member',
        date_of_birth: null,
        baptism_date: null,
        join_date: expect.any(String), // Should default to current date
        member_status: 'active',
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedMember,
        error: null,
      });

      const result = await DatabaseService.createMember(memberData);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...memberData,
        date_of_birth: null,
        baptism_date: null,
        join_date: expect.any(String),
        member_status: 'active',
      });
      expect(result).toEqual(mockCreatedMember);
    });

    it('should throw error when creation fails', async () => {
      const memberData = {
        first_name: 'Test',
        last_name: 'Member',
        member_status: 'active' as const,
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.createMember(memberData))
        .rejects.toThrow();
    });
  });

  describe('updateMember', () => {
    it('should update an existing member', async () => {
      const memberData = {
        first_name: 'Updated',
        last_name: 'Member',
        email: 'updated.member@example.com',
        department: 'Worship',
        member_status: 'active' as const,
      };

      const mockUpdatedMember = {
        id: 'member-1',
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

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedMember,
        error: null,
      });

      const result = await DatabaseService.updateMember('member-1', memberData);

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...memberData,
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'member-1');
      expect(result).toEqual(mockUpdatedMember);
    });

    it('should handle empty date strings by converting to null', async () => {
      const memberData = {
        first_name: 'Updated',
        last_name: 'Member',
        date_of_birth: '',
        baptism_date: '',
        join_date: '',
      };

      const mockUpdatedMember = {
        id: 'member-1',
        first_name: 'Updated',
        last_name: 'Member',
        date_of_birth: null,
        baptism_date: null,
        join_date: expect.any(String),
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUpdatedMember,
        error: null,
      });

      const result = await DatabaseService.updateMember('member-1', memberData);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...memberData,
        date_of_birth: null,
        baptism_date: null,
        join_date: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(result).toEqual(mockUpdatedMember);
    });

    it('should throw error when update fails', async () => {
      const memberData = {
        first_name: 'Updated',
        last_name: 'Member',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.updateMember('member-1', memberData))
        .rejects.toThrow();
    });
  });

  describe('deleteMember', () => {
    it('should delete a member', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: null,
      });

      await DatabaseService.deleteMember('member-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'member-1');
    });

    it('should throw error when deletion fails', async () => {
      mockSupabase.delete.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.deleteMember('member-1'))
        .rejects.toThrow();
    });
  });

  describe('getMemberById', () => {
    it('should fetch a member by ID', async () => {
      const mockMember = {
        id: 'member-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        address: '123 Main St',
        date_of_birth: '1990-01-01',
        baptism_date: '2010-01-01',
        join_date: '2020-01-01',
        member_status: 'active',
        department: 'Worship',
        profile_image: 'profile1.jpg',
        gender: 'male',
        marital_status: 'married',
        occupation: 'Engineer',
        emergency_contact: 'Jane Doe',
        notes: 'Active member',
        created_at: '2020-01-01T00:00:00Z',
        updated_at: '2020-01-01T00:00:00Z',
        member_tags: [
          { tag: 'leader' },
          { tag: 'worship' },
        ],
      };

      mockSupabase.single.mockResolvedValue({
        data: mockMember,
        error: null,
      });

      const result = await DatabaseService.getMemberById('member-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        member_tags (
          tag
        )
      `);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'member-1');
      expect(result).toEqual({
        ...mockMember,
        tags: ['leader', 'worship'],
      });
    });

    it('should return null when member not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await DatabaseService.getMemberById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await DatabaseService.getMemberById('member-1');

      expect(result).toBeNull();
    });
  });

  describe('bulkUpdateMembers', () => {
    it('should bulk update multiple members', async () => {
      const memberIds = ['member-1', 'member-2', 'member-3'];
      const updates = {
        member_status: 'inactive',
        department: 'General',
      };

      mockSupabase.update.mockResolvedValue({
        error: null,
      });

      await DatabaseService.bulkUpdateMembers(memberIds, updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', memberIds);
    });

    it('should throw error when bulk update fails', async () => {
      const memberIds = ['member-1', 'member-2'];
      const updates = { member_status: 'inactive' };

      mockSupabase.update.mockResolvedValue({
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.bulkUpdateMembers(memberIds, updates))
        .rejects.toThrow();
    });
  });

  describe('getFamilies', () => {
    it('should fetch all families', async () => {
      const mockFamilies = [
        { id: 'family-1', family_name: 'Doe Family' },
        { id: 'family-2', family_name: 'Smith Family' },
        { id: 'family-3', family_name: 'Johnson Family' },
      ];

      mockSupabase.single.mockResolvedValue({
        data: mockFamilies,
        error: null,
      });

      const result = await DatabaseService.getFamilies();

      expect(mockSupabase.from).toHaveBeenCalledWith('families');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('family_name', { ascending: true });
      expect(result).toEqual(mockFamilies);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await DatabaseService.getFamilies();

      expect(result).toEqual([]);
    });
  });

  describe('createFamily', () => {
    it('should create a new family', async () => {
      const familyData = {
        family_name: 'New Family',
      };

      const mockCreatedFamily = {
        id: 'family-4',
        family_name: 'New Family',
        created_at: '2023-01-15T00:00:00Z',
        updated_at: '2023-01-15T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCreatedFamily,
        error: null,
      });

      const result = await DatabaseService.createFamily(familyData);

      expect(mockSupabase.from).toHaveBeenCalledWith('families');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...familyData,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedFamily);
    });

    it('should throw error when creation fails', async () => {
      const familyData = {
        family_name: 'Test Family',
      };

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(DatabaseService.createFamily(familyData))
        .rejects.toThrow();
    });
  });
}); 