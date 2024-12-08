export type Giftee = {
  id: string;
  name: string;
  date_of_birth: string;
  on_christmas?: boolean;
  on_birthday?: boolean;
  ideas: Idea[];
};

export type Idea = {
  id: string;
  name: string;
  url: string;
  purchased_at: string | null;
};
