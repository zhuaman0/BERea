export interface ReadingBook {
  id:          string;
  title:       string;
  description: string;
  cover_url:   string | null;
}

export interface ReadingBookWrite {
  title:       string;
  description: string;
  cover_url:   string | null;
}
