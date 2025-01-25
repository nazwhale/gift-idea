export interface Giftee {
  id: string;
  name: string;
  date_of_birth?: string;
  bio?: string;
  on_christmas?: boolean;
  on_birthday?: boolean;
  ideas?: Idea[];
}

export interface Idea {
  id: string;
  name: string;
  url?: string;
  purchased_at?: string | null;
} 