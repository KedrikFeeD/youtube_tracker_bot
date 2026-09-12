import cron from 'node-cron';
import { schedulerConfig } from '../config/env.js';
import { checkScheduledStreamAnnouncements } from './scheduled-stream-announcements.js';
import { checkYoutube } from './youtube-checker.js';

export function startSchedulers(): void {
    cron.schedule(schedulerConfig.youtubeCheckCron, () => {
        checkYoutube().catch(error => {
            console.error('YouTube check failed:', error);
        });
    });

    cron.schedule(schedulerConfig.scheduledAnnouncementsCron, () => {
        checkScheduledStreamAnnouncements().catch(error => {
            console.error('Scheduled stream announcements check failed:', error);
        });
    });
}

export function runInitialChecks(): void {
    checkYoutube().catch(error => {
        console.error('Initial check failed:', error);
    });

    checkScheduledStreamAnnouncements().catch(error => {
        console.error('Initial scheduled stream announcements check failed:', error);
    });
}
