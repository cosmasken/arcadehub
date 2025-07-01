export interface Sponsor {
  name: string;
  logo: string;
  reward: string;
}

export interface Tournament {
  id: number;
  title: string;
  game: string;
  prize: string;
  participants: number;
  maxParticipants: number;
  startTime: string;
  status: string;
  duration: string;
  entryFee: string;
  type: string;
  description: string;
  rules: string[];
  sponsors: Sponsor[];
}