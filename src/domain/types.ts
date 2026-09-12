export type YoutubePostType = 'video' | 'upcoming_live' | 'live';

export interface StoredItem {
    videoId: string;
    type: YoutubePostType;
    postedAt: string;
}

export interface StoredAdmin {
    id: number;
    addedAt: string;
    username?: string;
    firstName?: string;
    lastName?: string;
}

export type ScheduledAnnouncementStatus = 'pending' | 'sent' | 'failed';

export interface ScheduledStreamAnnouncement {
    id: string;
    title: string;
    url: string;
    streamStartAt: string;
    sendAt: string;
    createdAt: string;
    createdBy: number;
    status: ScheduledAnnouncementStatus;
    sentAt?: string;
    error?: string;
}

export interface DbSchema {
    posted: StoredItem[];
    admins: StoredAdmin[];
    scheduledStreamAnnouncements: ScheduledStreamAnnouncement[];
}
