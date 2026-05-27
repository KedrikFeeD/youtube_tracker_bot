import { JSONFilePreset } from 'lowdb/node';
import type { Low } from 'lowdb';
import type { DbSchema, YoutubePostType } from './types.js';

const defaultData: DbSchema = {
    posted: [],
};

export const db: Low<DbSchema> = await JSONFilePreset<DbSchema>('db.json', defaultData);

export function wasPosted(videoId: string, type: YoutubePostType): boolean {
    return db.data.posted.some(
        item => item.videoId === videoId && item.type === type,
    );
}

export async function markPosted(videoId: string, type: YoutubePostType): Promise<void> {
    db.data.posted.push({
        videoId,
        type,
        postedAt: new Date().toISOString(),
    });

    await db.write();
}