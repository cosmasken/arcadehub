-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Drop tables if they exist (in reverse order of dependency)
DROP TABLE IF EXISTS user_role_assignments CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS tournament_participants CASCADE;
DROP TABLE IF EXISTS tournament_sponsors CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address CITEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    email CITEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    user_type VARCHAR(20) NOT NULL DEFAULT 'player',
    company_name TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_data JSONB,
    industry TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    onchain_id INTEGER,
    onchain_tx_hash TEXT,
    onchain_status TEXT,
    CONSTRAINT wallet_address_lowercase CHECK (wallet_address = LOWER(wallet_address))
);

-- User roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User role assignments
CREATE TABLE user_role_assignments (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Games catalog
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    contract_address TEXT,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournaments
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
    sponsor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prize_pool NUMERIC NOT NULL,
    entry_fee NUMERIC DEFAULT 0,
    max_participants INTEGER,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'upcoming',
    rules TEXT[],
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    onchain_id INTEGER,
    onchain_tx_hash TEXT,
    onchain_status TEXT
);

-- Tournament participants
CREATE TABLE tournament_participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    rank INTEGER,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    onchain_tx_hash TEXT,
    UNIQUE(tournament_id, user_id)
);

-- Tournament sponsors
CREATE TABLE tournament_sponsors (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    token_address TEXT,
    token_amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_tournaments INTEGER DEFAULT 0,
    tournaments_won INTEGER DEFAULT 0,
    total_prizes NUMERIC DEFAULT 0,
    win_rate NUMERIC(5, 2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_game_id ON tournaments(game_id);
CREATE INDEX idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_sponsors_tournament_id ON tournament_sponsors(tournament_id);

-- Add initial roles with proper JSON syntax
INSERT INTO user_roles (name, description, permissions) VALUES
    ('player', 'Regular player', '{"join_tournaments": true, "create_teams": true}'),
    ('sponsor', 'Tournament sponsor', '{"sponsor_tournaments": true, "create_tournaments": true}'),
    ('admin', 'System administrator', '{"manage_users": true, "manage_tournaments": true, "manage_games": true}');

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tournaments_modtime
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_roles_modtime
    BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own profile" 
    ON users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Public games are viewable by everyone"
    ON games FOR SELECT
    USING (is_active = true);

CREATE POLICY "Enable read access for all users"
    ON games
    FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON tournaments
    FOR SELECT
    USING (true);

    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make sure the anon role has minimal permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create new policies
CREATE POLICY "Enable all access for authenticated users" 
ON public.users 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow public to see user profiles (adjust if you need more privacy)
CREATE POLICY "Enable read access for all users"
ON public.users
FOR SELECT
TO public
USING (true);