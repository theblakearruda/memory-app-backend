export type Envelope = {
  id: number;
  userid: number;
  photourl: string;
  caption: string | null;
  location: string | null;
  created_at?: string | null;
  date?: string | null;
};