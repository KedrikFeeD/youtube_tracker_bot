export type YoutubePostType = 'video' | 'upcoming_live' | 'live';

export interface StoredItem {
    videoId: string;
    type: YoutubePostType;
    postedAt: string;
}

export interface DbSchema {
    posted: StoredItem[];
}