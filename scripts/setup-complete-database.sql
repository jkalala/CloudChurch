-- Complete database setup script for Smart Church Management App
-- This script runs all necessary steps in the correct order

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create all tables (from create-database-schema.sql)
-- Members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    member_status VARCHAR(20) DEFAULT 'active',
    family_id UUID,
    face_recognition_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Families table
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_name VARCHAR(100) NOT NULL,
    head_of_family UUID,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_members_family') THEN
        ALTER TABLE members ADD CONSTRAINT fk_members_family 
            FOREIGN KEY (family_id) REFERENCES families(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_families_head') THEN
        ALTER TABLE families ADD CONSTRAINT fk_families_head 
            FOREIGN KEY (head_of_family) REFERENCES members(id);
    END IF;
END $$;

-- Ministries table
CREATE TABLE IF NOT EXISTS ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES members(id),
    budget_allocated DECIMAL(10,2) DEFAULT 0,
    budget_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    event_type VARCHAR(50),
    max_capacity INTEGER,
    ministry_id UUID REFERENCES ministries(id),
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(50),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    ministry_id UUID REFERENCES ministries(id),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    event_id UUID REFERENCES events(id) NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    attendance_type VARCHAR(50),
    notes TEXT
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    member_id UUID REFERENCES members(id),
    rsvp_status VARCHAR(20) DEFAULT 'pending',
    rsvp_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id)
);

-- Choir members table
CREATE TABLE IF NOT EXISTS choir_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    voice_type VARCHAR(20),
    experience_level VARCHAR(20),
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active'
);

-- Sheet music table
CREATE TABLE IF NOT EXISTS sheet_music (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    composer VARCHAR(100),
    music_key VARCHAR(10),
    difficulty_level VARCHAR(20),
    duration INTERVAL,
    category VARCHAR(50),
    file_path TEXT,
    audio_file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outreach projects table
CREATE TABLE IF NOT EXISTS outreach_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2),
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_unit VARCHAR(50),
    start_date DATE,
    end_date DATE,
    location VARCHAR(200),
    coordinator_id UUID REFERENCES members(id),
    status VARCHAR(20) DEFAULT 'planning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer assignments table
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES outreach_projects(id),
    member_id UUID REFERENCES members(id),
    role VARCHAR(100),
    hours_committed INTEGER,
    hours_completed INTEGER DEFAULT 0,
    assignment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active'
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    achievement_type VARCHAR(50),
    achievement_name VARCHAR(100),
    achievement_description TEXT,
    points_earned INTEGER DEFAULT 0,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- User points table
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) UNIQUE,
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFT Certificates table
CREATE TABLE IF NOT EXISTS nft_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    certificate_type VARCHAR(50),
    token_id VARCHAR(100),
    contract_address VARCHAR(100),
    blockchain_network VARCHAR(50) DEFAULT 'polygon',
    metadata_uri TEXT,
    minted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_hash VARCHAR(100)
);

-- Prayer requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    request_type VARCHAR(50),
    privacy_level VARCHAR(20) DEFAULT 'public',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bible study progress table
CREATE TABLE IF NOT EXISTS bible_study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    book VARCHAR(50),
    chapter INTEGER,
    verse INTEGER,
    study_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    reading_plan VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_member_id ON financial_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_user_points_member_id ON user_points(member_id);

-- Step 3: Insert sample data with proper conflict handling
-- Insert sample families first
INSERT INTO families (id, family_name, address) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Johnson Family', '123 Grace Street, Nairobi, Kenya'),
    ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Okafor Family', '456 Faith Avenue, Lagos, Nigeria'),
    ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Mwangi Family', '789 Hope Road, Kampala, Uganda'),
    ('550e8400-e29b-41d4-a716-446655440004'::UUID, 'Asante Family', '321 Love Lane, Accra, Ghana'),
    ('550e8400-e29b-41d4-a716-446655440005'::UUID, 'Banda Family', '654 Peace Avenue, Lusaka, Zambia')
) AS v(id, family_name, address)
WHERE NOT EXISTS (SELECT 1 FROM families WHERE families.id = v.id);

-- Insert sample members
INSERT INTO members (id, first_name, last_name, email, phone, date_of_birth, gender, family_id, member_status) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440010'::UUID, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+254701234567', '1985-03-15'::DATE, 'Female', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440011'::UUID, 'Michael', 'Okafor', 'michael.okafor@email.com', '+234801234567', '1978-07-22'::DATE, 'Male', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440012'::UUID, 'Grace', 'Mwangi', 'grace.mwangi@email.com', '+256701234567', '1990-11-08'::DATE, 'Female', '550e8400-e29b-41d4-a716-446655440003'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440013'::UUID, 'David', 'Asante', 'david.asante@email.com', '+233201234567', '1982-05-30'::DATE, 'Male', '550e8400-e29b-41d4-a716-446655440004'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440014'::UUID, 'Mary', 'Johnson', 'mary.johnson@email.com', '+254701234568', '2005-09-12'::DATE, 'Female', '550e8400-e29b-41d4-a716-446655440001'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440015'::UUID, 'Peter', 'Okafor', 'peter.okafor@email.com', '+234801234568', '2008-04-18'::DATE, 'Male', '550e8400-e29b-41d4-a716-446655440002'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440016'::UUID, 'Ruth', 'Banda', 'ruth.banda@email.com', '+260971234567', '1992-12-03'::DATE, 'Female', '550e8400-e29b-41d4-a716-446655440005'::UUID, 'active'),
    ('550e8400-e29b-41d4-a716-446655440017'::UUID, 'James', 'Banda', 'james.banda@email.com', '+260971234568', '1988-06-25'::DATE, 'Male', '550e8400-e29b-41d4-a716-446655440005'::UUID, 'active')
) AS v(id, first_name, last_name, email, phone, date_of_birth, gender, family_id, member_status)
WHERE NOT EXISTS (SELECT 1 FROM members WHERE members.id = v.id);

-- Update family heads
UPDATE families SET head_of_family = '550e8400-e29b-41d4-a716-446655440010' WHERE id = '550e8400-e29b-41d4-a716-446655440001' AND head_of_family IS NULL;
UPDATE families SET head_of_family = '550e8400-e29b-41d4-a716-446655440011' WHERE id = '550e8400-e29b-41d4-a716-446655440002' AND head_of_family IS NULL;
UPDATE families SET head_of_family = '550e8400-e29b-41d4-a716-446655440012' WHERE id = '550e8400-e29b-41d4-a716-446655440003' AND head_of_family IS NULL;
UPDATE families SET head_of_family = '550e8400-e29b-41d4-a716-446655440013' WHERE id = '550e8400-e29b-41d4-a716-446655440004' AND head_of_family IS NULL;
UPDATE families SET head_of_family = '550e8400-e29b-41d4-a716-446655440017' WHERE id = '550e8400-e29b-41d4-a716-446655440005' AND head_of_family IS NULL;

-- Insert sample ministries
INSERT INTO ministries (id, name, description, leader_id, budget_allocated, budget_spent) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440020'::UUID, 'Youth Ministry', 'Ministry focused on young people and teenagers', '550e8400-e29b-41d4-a716-446655440011'::UUID, 2000.00, 1800.00),
    ('550e8400-e29b-41d4-a716-446655440021'::UUID, 'Choir Department', 'Music and worship ministry', '550e8400-e29b-41d4-a716-446655440010'::UUID, 1500.00, 1350.00),
    ('550e8400-e29b-41d4-a716-446655440022'::UUID, 'Sunday School', 'Children education and spiritual development', '550e8400-e29b-41d4-a716-446655440012'::UUID, 1000.00, 650.00),
    ('550e8400-e29b-41d4-a716-446655440023'::UUID, 'Outreach Program', 'Community service and evangelism', '550e8400-e29b-41d4-a716-446655440013'::UUID, 2500.00, 1200.00),
    ('550e8400-e29b-41d4-a716-446655440024'::UUID, 'Women''s Ministry', 'Fellowship and support for women', '550e8400-e29b-41d4-a716-446655440016'::UUID, 800.00, 450.00)
) AS v(id, name, description, leader_id, budget_allocated, budget_spent)
WHERE NOT EXISTS (SELECT 1 FROM ministries WHERE ministries.id = v.id);

-- Insert sample events
INSERT INTO events (id, title, description, event_date, start_time, end_time, location, event_type, max_capacity, ministry_id, created_by) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440030'::UUID, 'Sunday Morning Service', 'Weekly worship service with communion', CURRENT_DATE + INTERVAL '7 days', '09:00'::TIME, '11:00'::TIME, 'Main Sanctuary', 'service', 500, '550e8400-e29b-41d4-a716-446655440021'::UUID, '550e8400-e29b-41d4-a716-446655440010'::UUID),
    ('550e8400-e29b-41d4-a716-446655440031'::UUID, 'Youth Fellowship', 'Monthly youth gathering and Bible study', CURRENT_DATE + INTERVAL '10 days', '18:00'::TIME, '20:00'::TIME, 'Youth Hall', 'fellowship', 100, '550e8400-e29b-41d4-a716-446655440020'::UUID, '550e8400-e29b-41d4-a716-446655440011'::UUID),
    ('550e8400-e29b-41d4-a716-446655440032'::UUID, 'Choir Practice', 'Weekly choir rehearsal for Sunday service', CURRENT_DATE + INTERVAL '3 days', '19:00'::TIME, '21:00'::TIME, 'Music Room', 'practice', 30, '550e8400-e29b-41d4-a716-446655440021'::UUID, '550e8400-e29b-41d4-a716-446655440010'::UUID)
) AS v(id, title, description, event_date, start_time, end_time, location, event_type, max_capacity, ministry_id, created_by)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE events.id = v.id);

-- Insert sample financial transactions
INSERT INTO financial_transactions (member_id, amount, transaction_type, payment_method, ministry_id, notes) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440010'::UUID, 250.00, 'tithe', 'mpesa', NULL::UUID, 'Monthly tithe - January 2024'),
    ('550e8400-e29b-41d4-a716-446655440011'::UUID, 180.00, 'tithe', 'mtn_money', NULL::UUID, 'Monthly tithe - January 2024'),
    ('550e8400-e29b-41d4-a716-446655440012'::UUID, 320.00, 'tithe', 'cash', NULL::UUID, 'Monthly tithe - January 2024'),
    ('550e8400-e29b-41d4-a716-446655440013'::UUID, 200.00, 'offering', 'airtel_money', '550e8400-e29b-41d4-a716-446655440023'::UUID, 'Special offering for outreach')
) AS v(member_id, amount, transaction_type, payment_method, ministry_id, notes)
WHERE NOT EXISTS (SELECT 1 FROM financial_transactions WHERE financial_transactions.member_id = v.member_id AND financial_transactions.amount = v.amount AND financial_transactions.notes = v.notes);

-- Insert sample user achievements (using actual member IDs)
INSERT INTO user_achievements (member_id, achievement_type, achievement_name, achievement_description, points_earned, metadata) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440010'::UUID, 'badge', 'Faithful Servant', '3-month tithing streak', 100, '{"streak_months": 3, "category": "giving"}'::JSONB),
    ('550e8400-e29b-41d4-a716-446655440011'::UUID, 'badge', 'Prayer Warrior', 'Attended 20 prayer meetings', 75, '{"meetings_attended": 20, "category": "spiritual"}'::JSONB),
    ('550e8400-e29b-41d4-a716-446655440012'::UUID, 'badge', 'Community Helper', '50 volunteer hours completed', 150, '{"hours_completed": 50, "category": "service"}'::JSONB),
    ('550e8400-e29b-41d4-a716-446655440013'::UUID, 'badge', 'Worship Leader', 'Led 10 worship sessions', 125, '{"sessions_led": 10, "category": "ministry"}'::JSONB)
) AS v(member_id, achievement_type, achievement_name, achievement_description, points_earned, metadata)
WHERE NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_achievements.member_id = v.member_id AND user_achievements.achievement_name = v.achievement_name);

-- Insert sample user points
INSERT INTO user_points (member_id, total_points, current_level, current_streak, longest_streak, last_activity_date) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440010'::UUID, 2450, 12, 12, 45, CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440011'::UUID, 1850, 9, 8, 32, CURRENT_DATE - INTERVAL '1 day'),
    ('550e8400-e29b-41d4-a716-446655440012'::UUID, 3200, 15, 25, 28, CURRENT_DATE),
    ('550e8400-e29b-41d4-a716-446655440013'::UUID, 2800, 13, 18, 25, CURRENT_DATE - INTERVAL '2 days')
) AS v(member_id, total_points, current_level, current_streak, longest_streak, last_activity_date)
WHERE NOT EXISTS (SELECT 1 FROM user_points WHERE user_points.member_id = v.member_id);

-- Insert sample choir members
INSERT INTO choir_members (member_id, voice_type, experience_level) 
SELECT * FROM (VALUES
    ('550e8400-e29b-41d4-a716-446655440010'::UUID, 'soprano', 'advanced'),
    ('550e8400-e29b-41d4-a716-446655440012'::UUID, 'alto', 'intermediate'),
    ('550e8400-e29b-41d4-a716-446655440011'::UUID, 'tenor', 'advanced'),
    ('550e8400-e29b-41d4-a716-446655440013'::UUID, 'bass', 'expert')
) AS v(member_id, voice_type, experience_level)
WHERE NOT EXISTS (SELECT 1 FROM choir_members WHERE choir_members.member_id = v.member_id);

-- Insert sample sheet music
INSERT INTO sheet_music (title, composer, music_key, difficulty_level, duration, category, file_path, audio_file_path) 
SELECT * FROM (VALUES
    ('Amazing Grace', 'John Newton', 'G Major', 'beginner', '00:04:30'::INTERVAL, 'hymn', '/music/amazing-grace.pdf', '/audio/amazing-grace.mp3'),
    ('How Great Thou Art', 'Carl Boberg', 'Bb Major', 'intermediate', '00:05:15'::INTERVAL, 'hymn', '/music/how-great-thou-art.pdf', '/audio/how-great-thou-art.mp3'),
    ('Waymaker', 'Sinach', 'C Major', 'intermediate', '00:06:20'::INTERVAL, 'contemporary', '/music/waymaker.pdf', '/audio/waymaker.mp3')
) AS v(title, composer, music_key, difficulty_level, duration, category, file_path, audio_file_path)
WHERE NOT EXISTS (SELECT 1 FROM sheet_music WHERE sheet_music.title = v.title);

-- Show completion status
SELECT 'Database setup completed successfully!' as status;

-- Show table counts
SELECT 
    'members' as table_name,
    COUNT(*) as record_count
FROM members
UNION ALL
SELECT 
    'families' as table_name,
    COUNT(*) as record_count
FROM families
UNION ALL
SELECT 
    'ministries' as table_name,
    COUNT(*) as record_count
FROM ministries
UNION ALL
SELECT 
    'events' as table_name,
    COUNT(*) as record_count
FROM events
UNION ALL
SELECT 
    'financial_transactions' as table_name,
    COUNT(*) as record_count
FROM financial_transactions
UNION ALL
SELECT 
    'user_achievements' as table_name,
    COUNT(*) as record_count
FROM user_achievements
UNION ALL
SELECT 
    'user_points' as table_name,
    COUNT(*) as record_count
FROM user_points
UNION ALL
SELECT 
    'choir_members' as table_name,
    COUNT(*) as record_count
FROM choir_members
UNION ALL
SELECT 
    'sheet_music' as table_name,
    COUNT(*) as record_count
FROM sheet_music
ORDER BY table_name;
