import 'dotenv/config';
import cron from 'node-cron';
import { getYoutubeItems } from './youtube.js';
import {
    markPosted,
    wasLiveRelated,
    wasPosted
} from './db.js';
import { postToTelegram } from './telegram.js';

const cronExpression = process.env.CHECK_CRON ?? '*/1 * * * *';

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

async function checkYoutube(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Checking YouTube...`);

    const items = await getYoutubeItems();

    for (const item of items.reverse()) {
        if (
            wasPosted(item.videoId, item.type) ||
            !isRecentVideo(item.publishedAt, 24)
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

cron.schedule(cronExpression, () => {
    checkYoutube().catch(error => {
        console.error('YouTube check failed:', error);
    });
});

checkYoutube().catch(error => {
    console.error('Initial check failed:', error);
});