export type Client = {
  id: number;
  created_at: string;
  user_telegram_id: string | null;
  first_name: string | null;
  last_name: string | null;
  last_message_at: string;
};

export type Message = {
  id: number;
  created_at: string;
  author: string | null;
  body: string | null;
  messenger_user_id: string | null;
  messenger_type: string | null;
  client_id: number | null;
};
