import type { YoutubePostType } from '../domain/types.js';
import { db } from './database.js';

export function wasPosted(videoId: string, type: YoutubePostType): boolean {
    return db.data.posted.some(
        item => item.videoId === videoId && item.type === type,
    );
}

export function wasLiveRelated(videoId: string): boolean {
    return db.data.posted.some(
        item =>
            item.videoId === videoId &&
            (
                item.type === 'upcoming_live' ||
                item.type === 'live'
            ),
    );
}

export async function markPosted(
    videoId: string,
    type: YoutubePostType,
): Promise<void> {
    db.data.posted.push({
        videoId,
        type,
        postedAt: new Date().toISOString(),
    });

    await db.write();
}
