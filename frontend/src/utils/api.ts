// src/utils/api.ts

const BASE_URL = 'http://127.0.0.1:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  query: string;
  persona: string;
  language: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  source: string;
}

export interface MatchResponse {
  status: string;
  match: string;
}

export interface TimelineResponse {
  timeline: string;
}

export interface StatsBombMatch {
  match_id: number;
  match_date: string;
  home_team: {
    home_team_name: string;
  };
  away_team: {
    away_team_name: string;
  };
  home_score: number;
  away_score: number;
  competition_stage: {
    name: string;
  };
}

export interface MatchesSearchResponse {
  status: string;
  matches: StatsBombMatch[];
}

/**
 * Fetches the current live match context from the backend (/match/current)
 */
export const fetchCurrentMatch = async (): Promise<MatchResponse> => {
  const response = await fetch(`${BASE_URL}/match/current`);
  if (!response.ok) {
    throw new Error('Could not retrieve current match info…');
  }
  return response.json();
};

/**
 * Fetches the tactical timeline events for a given match ID from the backend (/timeline/{match_id})
 */
export const fetchTimeline = async (matchId: string): Promise<TimelineResponse> => {
  const response = await fetch(`${BASE_URL}/timeline/${matchId}`);
  if (!response.ok) {
    throw new Error('Could not retrieve match timeline…');
  }
  return response.json();
};

/**
 * Searches historical World Cup matches from the backend (/matches/search)
 */
export const searchMatches = async (query?: string): Promise<MatchesSearchResponse> => {
  const url = query 
    ? `${BASE_URL}/matches/search?q=${encodeURIComponent(query)}`
    : `${BASE_URL}/matches/search`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Match search failed…');
  }
  return response.json();
};

/**
 * Sends a chat query to the backend (/chat) and returns the adaptive text reply + source citation
 */
export const fetchChatResponse = async (payload: ChatRequest): Promise<ChatResponse> => {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('AI generation session failed…');
  }
  return response.json();
};

export interface AuthUser {
  username: string;
  team: string | null;
  level: string | null;
  language: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const registerUser = async (username: string, password: string): Promise<any> => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Registration failed…');
  }
  return response.json();
};

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed…');
  }
  return response.json();
};

export const getCurrentUser = async (token: string): Promise<AuthUser> => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Session expired or invalid…');
  }
  return response.json();
};

export const saveUserProfile = async (
  token: string,
  team: string,
  level: string,
  language: string
): Promise<{ status: string; user: AuthUser }> => {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ team, level, language })
  });
  if (!response.ok) {
    throw new Error('Failed to save profile…');
  }
  return response.json();
};

