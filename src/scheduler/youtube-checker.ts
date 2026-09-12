import {
    markPosted,
    wasLiveRelated,
    wasPosted,
} from '../storage/posted.repository.js';
import { postToTelegram } from '../telegram/channel-publisher.js';
import { getYoutubeItems } from '../youtube.js';
import { isShort } from '../helpers/shorts-video.helper.js';

function isRecentVideo(
    publishedAt: string,
    maxAgeHours: number,
): boolean {
    const publishedTime =
        new Date(publishedAt).getTime();

    const now = Date.now();

    const diffHours =
        (now - publishedTime) / 1000 / 60 / 60;

    return diffHours <= maxAgeHours;
}

export async function checkYoutube(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Checking YouTube...`);

    const items = await getYoutubeItems();

    for (const item of items.reverse()) {
        if (
            wasPosted(item.videoId, item.type) ||
            !isRecentVideo(item.publishedAt, 24) ||
            isShort(item)
        ) {
            continue;
        }

        if (
            item.type === 'video' &&
            wasLiveRelated(item.videoId)
        ) {
            continue;
        }

        await postToTelegram(item);
        await markPosted(item.videoId, item.type);

        console.log(`Posted ${item.type}: ${item.title}`);
    }

    console.log(`[${new Date().toISOString()}] Checking complete.`);
}
