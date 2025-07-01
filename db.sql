CREATE TABLE public.tournaments (
    id BIGINT PRIMARY KEY, -- Matches on-chain tournamentId
    title TEXT NOT NULL,
    game_id TEXT NOT NULL REFERENCES games(game_id), -- Link to games table
    description TEXT,
    sponsor_id UUID REFERENCES auth.users(id),
    max_participants INTEGER NOT NULL,
    duration_hours INTEGER NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    rules TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament participants table
CREATE TABLE public.tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    player_wallet TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tournament_id, player_wallet)
);

CREATE INDEX idx_tournaments_game_id ON tournaments(game_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournament_participants_user_id ON tournament_participants(user_id);
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);