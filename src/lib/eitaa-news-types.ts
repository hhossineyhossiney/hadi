export interface EitaaNewsItem {
  id: string;
  title: string;
  body: string;
  dateLabel: string;
  publishedAt: string | null;
  sourceUrl: string;
  imageUrl?: string;
}

export interface EitaaNewsFeed {
  channelName: string;
  channelUrl: string;
  refreshedAt: string;
  items: EitaaNewsItem[];
}
