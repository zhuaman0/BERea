export interface ReadingBook {
  id:          string;
  title:       string;
  description: string;
  cover_url:   string | null;
  language:    string | null;
  genre:       string | null;
  page_count:  number | null;
}

export interface ReadingBookWrite {
  title:       string;
  description: string;
  cover_url:   string | null;
  language:    string | null;
  genre:       string | null;
  page_count:  number | null;
}
