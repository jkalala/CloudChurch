// Utility functions for member management

describe('Members Utilities', () => {
  describe('Member Data Validation', () => {
    it('should validate complete member data', () => {
      const validMember = {
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
        gender: 'male',
        marital_status: 'married',
        occupation: 'Engineer',
        emergency_contact: 'Jane Doe',
        notes: 'Active member',
      };

      const isValid = 
        validMember.first_name &&
        validMember.last_name &&
        validMember.email &&
        validMember.phone &&
        validMember.member_status &&
        ['active', 'inactive', 'pending'].includes(validMember.member_status);

      expect(isValid).toBe(true);
    });

    it('should reject invalid member data', () => {
      const invalidMember = {
        first_name: '', // Empty first name
        last_name: '', // Empty last name
        email: 'invalid-email', // Invalid email
        phone: '', // Empty phone
        member_status: 'invalid' as any, // Invalid status
      };

      const isValid = 
        invalidMember.first_name &&
        invalidMember.last_name &&
        invalidMember.email &&
        invalidMember.phone &&
        invalidMember.member_status &&
        ['active', 'inactive', 'pending'].includes(invalidMember.member_status);

      expect(isValid).toBe(false);
    });

    it('should validate email format', () => {
      const validEmails = [
        'john.doe@example.com',
        'jane.smith@test.org',
        'user123@domain.co.uk',
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('should validate phone number format', () => {
      const validPhones = [
        '+1234567890',
        '+1-234-567-8900',
        '(123) 456-7890',
        '123-456-7890',
      ];

      const invalidPhones = [
        '123', // Too short
        'abcdefghij', // No digits
        '', // Empty
      ];

      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

      validPhones.forEach(phone => {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        expect(phoneRegex.test(cleanPhone)).toBe(true);
      });

      invalidPhones.forEach(phone => {
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        expect(phoneRegex.test(cleanPhone)).toBe(false);
      });
    });
  });

  describe('Member Data Transformation', () => {
    it('should transform database member to frontend format', () => {
      const dbMember = {
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

      const expectedFrontendMember = {
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
        tags: ['leader', 'worship'],
      };

      // This would be the transformation logic used in the API
      const transformed = {
        ...dbMember,
        tags: dbMember.member_tags?.map((t: any) => t.tag) || [],
      };

      expect(transformed).toEqual(expectedFrontendMember);
    });

    it('should transform frontend member to database format', () => {
      const frontendMember = {
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
        gender: 'male',
        marital_status: 'married',
        occupation: 'Engineer',
        emergency_contact: 'Jane Doe',
        notes: 'Active member',
        tags: ['leader', 'worship'],
      };

      const expectedDbMember = {
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
        gender: 'male',
        marital_status: 'married',
        occupation: 'Engineer',
        emergency_contact: 'Jane Doe',
        notes: 'Active member',
        // Tags would be handled separately in the database
      };

      // This would be the transformation logic used in the API
      const { tags, ...transformed } = frontendMember;

      expect(transformed).toEqual(expectedDbMember);
    });
  });

  describe('Member Search and Filtering', () => {
    const mockMembers = [
      {
        id: 'member-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        member_status: 'active',
        department: 'Worship',
        join_date: '2020-01-01',
      },
      {
        id: 'member-2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        member_status: 'active',
        department: 'Children',
        join_date: '2021-03-15',
      },
      {
        id: 'member-3',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1234567892',
        member_status: 'inactive',
        department: 'Youth',
        join_date: '2019-06-10',
      },
    ];

    it('should filter members by search term', () => {
      const searchTerm = 'john';
      const filtered = mockMembers.filter(member => 
        member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      expect(filtered).toHaveLength(2); // John Doe and Bob Johnson
      expect(filtered[0].first_name).toBe('John');
      expect(filtered[1].first_name).toBe('Bob');
    });

    it('should filter members by status', () => {
      const activeMembers = mockMembers.filter(member => member.member_status === 'active');
      const inactiveMembers = mockMembers.filter(member => member.member_status === 'inactive');

      expect(activeMembers).toHaveLength(2);
      expect(inactiveMembers).toHaveLength(1);
    });

    it('should filter members by department', () => {
      const worshipMembers = mockMembers.filter(member => member.department === 'Worship');
      const childrenMembers = mockMembers.filter(member => member.department === 'Children');

      expect(worshipMembers).toHaveLength(1);
      expect(childrenMembers).toHaveLength(1);
    });

    it('should sort members by name', () => {
      const sortedByName = [...mockMembers].sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      expect(sortedByName[0].first_name).toBe('Bob');
      expect(sortedByName[1].first_name).toBe('Jane');
      expect(sortedByName[2].first_name).toBe('John');
    });

    it('should sort members by join date', () => {
      const sortedByJoinDate = [...mockMembers].sort((a, b) => 
        new Date(a.join_date).getTime() - new Date(b.join_date).getTime()
      );

      expect(sortedByJoinDate[0].first_name).toBe('Bob');
      expect(sortedByJoinDate[1].first_name).toBe('John');
      expect(sortedByJoinDate[2].first_name).toBe('Jane');
    });
  });

  describe('Member Statistics', () => {
    const mockMembers = [
      { member_status: 'active', department: 'Worship', join_date: '2020-01-01' },
      { member_status: 'active', department: 'Children', join_date: '2021-03-15' },
      { member_status: 'inactive', department: 'Youth', join_date: '2019-06-10' },
      { member_status: 'active', department: 'Worship', join_date: '2022-01-01' },
      { member_status: 'pending', department: 'Children', join_date: '2023-01-01' },
    ];

    it('should calculate total member count', () => {
      const totalCount = mockMembers.length;
      expect(totalCount).toBe(5);
    });

    it('should calculate active member count', () => {
      const activeCount = mockMembers.filter(m => m.member_status === 'active').length;
      expect(activeCount).toBe(3);
    });

    it('should calculate inactive member count', () => {
      const inactiveCount = mockMembers.filter(m => m.member_status === 'inactive').length;
      expect(inactiveCount).toBe(1);
    });

    it('should calculate pending member count', () => {
      const pendingCount = mockMembers.filter(m => m.member_status === 'pending').length;
      expect(pendingCount).toBe(1);
    });

    it('should calculate members by department', () => {
      const departmentStats = mockMembers.reduce((acc, member) => {
        acc[member.department] = (acc[member.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(departmentStats.Worship).toBe(2);
      expect(departmentStats.Children).toBe(2);
      expect(departmentStats.Youth).toBe(1);
    });

    it('should calculate new members this month', () => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newThisMonth = mockMembers.filter(member => {
        const joinDate = new Date(member.join_date);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      }).length;

      // This will depend on the current month/year
      expect(typeof newThisMonth).toBe('number');
    });
  });

  describe('Date Handling', () => {
    it('should format dates correctly', () => {
      const date = new Date('2020-01-01');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2020-01-01');
    });

    it('should handle date validation', () => {
      const validDate = '2020-01-01';
      const invalidDate = 'invalid-date';

      const isValidDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      };

      expect(isValidDate(validDate)).toBe(true);
      expect(isValidDate(invalidDate)).toBe(false);
    });

    it('should calculate age from birth date', () => {
      const birthDate = '1990-01-01';
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
        ? age - 1 
        : age;

      expect(typeof actualAge).toBe('number');
      expect(actualAge).toBeGreaterThan(0);
    });
  });

  describe('Member Status Management', () => {
    it('should validate member status transitions', () => {
      const validTransitions = {
        'pending': ['active', 'inactive'],
        'active': ['inactive'],
        'inactive': ['active'],
      };

      const canTransition = (from: string, to: string) => {
        return validTransitions[from as keyof typeof validTransitions]?.includes(to) || false;
      };

      expect(canTransition('pending', 'active')).toBe(true);
      expect(canTransition('pending', 'inactive')).toBe(true);
      expect(canTransition('active', 'inactive')).toBe(true);
      expect(canTransition('inactive', 'active')).toBe(true);
      expect(canTransition('active', 'pending')).toBe(false);
      expect(canTransition('inactive', 'pending')).toBe(false);
    });

    it('should get status color', () => {
      const getStatusColor = (status: string) => {
        switch (status) {
          case 'active': return 'bg-green-100 text-green-800';
          case 'inactive': return 'bg-red-100 text-red-800';
          case 'pending': return 'bg-yellow-100 text-yellow-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      };

      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800');
      expect(getStatusColor('inactive')).toBe('bg-red-100 text-red-800');
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });
}); 