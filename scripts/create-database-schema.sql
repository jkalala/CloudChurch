-- Church Management System Database Schema
-- This script creates the core tables for the Smart Church Management App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE members (
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
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_name VARCHAR(100) NOT NULL,
    head_of_family UUID REFERENCES members(id),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for family_id in members table
ALTER TABLE members ADD CONSTRAINT fk_members_family 
    FOREIGN KEY (family_id) REFERENCES families(id);

-- Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    event_id UUID REFERENCES events(id) NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    attendance_type VARCHAR(50), -- 'service', 'meeting', 'event'
    notes TEXT
);

-- Financial transactions table
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(50), -- 'tithe', 'offering', 'donation'
    payment_method VARCHAR(50), -- 'cash', 'mpesa', 'mtn_money', 'airtel_money'
    transaction_reference VARCHAR(100),
    ministry_id UUID,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Ministries/Departments table
CREATE TABLE ministries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES members(id),
    budget_allocated DECIMAL(10,2) DEFAULT 0,
    budget_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    event_type VARCHAR(50), -- 'service', 'meeting', 'outreach', 'fellowship'
    max_capacity INTEGER,
    ministry_id UUID REFERENCES ministries(id),
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event RSVPs table
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    member_id UUID REFERENCES members(id),
    rsvp_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'declined'
    rsvp_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, member_id)
);

-- Choir members table
CREATE TABLE choir_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    voice_type VARCHAR(20), -- 'soprano', 'alto', 'tenor', 'bass'
    experience_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'expert'
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active'
);

-- Sheet music table
CREATE TABLE sheet_music (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    composer VARCHAR(100),
    music_key VARCHAR(10),
    difficulty_level VARCHAR(20),
    duration INTERVAL,
    category VARCHAR(50), -- 'hymn', 'contemporary', 'gospel'
    file_path TEXT,
    audio_file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outreach projects table
CREATE TABLE outreach_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2),
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_unit VARCHAR(50), -- 'kg food', 'supply kits', 'visits'
    start_date DATE,
    end_date DATE,
    location VARCHAR(200),
    coordinator_id UUID REFERENCES members(id),
    status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer assignments table
CREATE TABLE volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES outreach_projects(id),
    member_id UUID REFERENCES members(id),
    role VARCHAR(100),
    hours_committed INTEGER,
    hours_completed INTEGER DEFAULT 0,
    assignment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active'
);

-- Gamification - User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    achievement_type VARCHAR(50), -- 'badge', 'level', 'streak'
    achievement_name VARCHAR(100),
    achievement_description TEXT,
    points_earned INTEGER DEFAULT 0,
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Store additional achievement data
);

-- User points/XP table
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NFT Certificates table (for blockchain integration)
CREATE TABLE nft_certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    certificate_type VARCHAR(50), -- 'membership', 'baptism', 'service'
    token_id VARCHAR(100),
    contract_address VARCHAR(100),
    blockchain_network VARCHAR(50) DEFAULT 'polygon',
    metadata_uri TEXT,
    minted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_hash VARCHAR(100)
);

-- Prayer requests table
CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    request_type VARCHAR(50), -- 'personal', 'family', 'community', 'urgent'
    privacy_level VARCHAR(20) DEFAULT 'public', -- 'public', 'ministry', 'private'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'answered', 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bible study progress table
CREATE TABLE bible_study_progress (
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
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_family_id ON members(family_id);
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(check_in_time);
CREATE INDEX idx_financial_transactions_member_id ON financial_transactions(member_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_user_points_member_id ON user_points(member_id);

-- Insert sample ministries
INSERT INTO ministries (name, description, budget_allocated) VALUES
('Youth Ministry', 'Ministry focused on young people and teenagers', 2000.00),
('Choir Department', 'Music and worship ministry', 1500.00),
('Sunday School', 'Children education and spiritual development', 1000.00),
('Outreach Program', 'Community service and evangelism', 2500.00),
('Women''s Ministry', 'Fellowship and support for women', 800.00),
('Men''s Ministry', 'Fellowship and discipleship for men', 800.00);

-- Insert sample achievement types
INSERT INTO user_achievements (member_id, achievement_type, achievement_name, achievement_description, points_earned) 
SELECT 
    uuid_generate_v4(), 
    'badge', 
    'Welcome Badge', 
    'Joined the church community', 
    50
WHERE NOT EXISTS (SELECT 1 FROM user_achievements WHERE achievement_name = 'Welcome Badge');
