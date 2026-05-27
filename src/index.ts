import 'dotenv/config';
import cron from 'node-cron';
import { getActiveLives, getLatestVideos, getUpcomingLives } from './youtube.js';
import { markPosted, wasPosted } from './db.js';
import { postToTelegram } from './telegram.js';

const cronExpression = process.env.CHECK_CRON ?? '*/5 * * * *';

async function checkYoutube(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Checking YouTube...`);

    const items = [
        ...(await getLatestVideos()),
        ...(await getUpcomingLives()),
        ...(await getActiveLives()),
    ];

    for (const item of items.reverse()) {
        if (wasPosted(item.videoId, item.type)) {
            continue;
        }

        await postToTelegram(item);
        await markPosted(item.videoId, item.type);

        console.log(`Posted ${item.type}: ${item.title}`);
    }
}

cron.schedule(cronExpression, () => {
    checkYoutube().catch(error => {
        console.error('YouTube check failed:', error);
    });
});

checkYoutube().catch(error => {
    console.error('Initial check failed:', error);
});