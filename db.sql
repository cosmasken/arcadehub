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

-- Wallet transactions
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'REWARD', 'TOURNAMENT_WIN', 'PURCHASE', 'REFUND'
    amount NUMERIC(36, 18) NOT NULL,
    token_address TEXT NOT NULL,
    token_symbol VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
    tx_hash TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_transaction_type CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'REWARD', 'TOURNAMENT_WIN', 'PURCHASE', 'REFUND')),
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'))
);

-- User wallet balances
CREATE TABLE user_wallet_balances (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_balance NUMERIC(36, 18) NOT NULL DEFAULT 0,
    available_balance NUMERIC(36, 18) NOT NULL DEFAULT 0,
    locked_balance NUMERIC(36, 18) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending rewards
CREATE TABLE pending_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(36, 18) NOT NULL,
    token_address TEXT NOT NULL,
    token_symbol VARCHAR(20) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'TOURNAMENT', 'REFERRAL', 'AFFILIATE', 'PROMOTION'
    source_id TEXT, -- ID of the source (e.g., tournament_id)
    unlock_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CLAIMED', 'EXPIRED', 'CANCELLED'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'CLAIMED', 'EXPIRED', 'CANCELLED'))
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

-- Function to claim a reward
CREATE OR REPLACE FUNCTION claim_reward(
    p_reward_id UUID,
    p_user_id UUID
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    v_reward RECORD;
    v_balance NUMERIC(36, 18);
    v_result JSONB;
BEGIN
    -- Get the reward details
    SELECT * INTO v_reward
    FROM pending_rewards
    WHERE id = p_reward_id
    AND user_id = p_user_id
    AND status = 'PENDING'
    AND unlock_at <= NOW()
    FOR UPDATE;

    -- Check if reward exists and is claimable
    IF v_reward IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Reward not found, already claimed, or not yet available'
        );
    END IF;

    -- Start a transaction
    BEGIN
        -- Update the reward status to claimed
        UPDATE pending_rewards
        SET status = 'CLAIMED',
            updated_at = NOW()
        WHERE id = p_reward_id;

        -- Insert a transaction record
        INSERT INTO wallet_transactions (
            user_id,
            type,
            amount,
            token_address,
            token_symbol,
            status,
            metadata
        ) VALUES (
            p_user_id,
            'REWARD',
            v_reward.amount,
            v_reward.token_address,
            v_reward.token_symbol,
            'COMPLETED',
            jsonb_build_object(
                'source_type', v_reward.source_type,
                'source_id', v_reward.source_id,
                'original_reward_id', v_reward.id
            )
        );

        -- Update the user's wallet balance
        INSERT INTO user_wallet_balances (
            user_id,
            total_balance,
            available_balance,
            locked_balance
        )
        VALUES (
            p_user_id,
            COALESCE((SELECT total_balance FROM user_wallet_balances WHERE user_id = p_user_id), 0) + v_reward.amount,
            COALESCE((SELECT available_balance FROM user_wallet_balances WHERE user_id = p_user_id), 0) + v_reward.amount,
            COALESCE((SELECT locked_balance FROM user_wallet_balances WHERE user_id = p_user_id), 0)
        )
        ON CONFLICT (user_id) DO UPDATE
        SET 
            total_balance = user_wallet_balances.total_balance + v_reward.amount,
            available_balance = user_wallet_balances.available_balance + v_reward.amount,
            updated_at = NOW();

        -- Return success
        v_result := jsonb_build_object(
            'success', true,
            'amount', v_reward.amount,
            'token_symbol', v_reward.token_symbol
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback the transaction on error
        v_result := jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
    END;

    RETURN v_result;
END;
$$;

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