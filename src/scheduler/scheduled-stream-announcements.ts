import {
    getDueScheduledStreamAnnouncements,
    markScheduledStreamAnnouncementFailed,
    markScheduledStreamAnnouncementSent,
} from '../storage/scheduled-announcements.repository.js';
import { postScheduledStreamAnnouncement } from '../telegram/channel-publisher.js';

export async function checkScheduledStreamAnnouncements(): Promise<void> {
    const announcements = getDueScheduledStreamAnnouncements();

    for (const announcement of announcements) {
        try {
            await postScheduledStreamAnnouncement(announcement);
            await markScheduledStreamAnnouncementSent(announcement.id);

            console.log(`Posted scheduled stream announcement: ${announcement.title}`);
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : String(error);

            await markScheduledStreamAnnouncementFailed(announcement.id, message);

            console.error(
                `Scheduled stream announcement failed (${announcement.id}):`,
                error,
            );
        }
    }
}
