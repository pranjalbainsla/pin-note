export type User = {
  id: string;
  email: string;
};
export type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isBootstrapping: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};
export type Note = {
    id: string;
    title: string;
    content: string | null;
    font_size_px: number;
    created_at: string | null;
    updated_at: string | null;
}
export type Pin = {
    id: string;
    user_id: string;
    source_type: string | null;
    source_url: string | null;
    title: string;
    summary: string;
    thumbnail_url: string | null;
    author: string | null;
    description: string | null;
    created_at: string | null;
}