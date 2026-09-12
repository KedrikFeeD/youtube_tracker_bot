import { randomUUID } from 'node:crypto';
import type { ScheduledStreamAnnouncement } from '../domain/types.js';
import {
    db,
    getScheduledStreamAnnouncements,
} from './database.js';

export async function addScheduledStreamAnnouncement(
    announcement: Omit<ScheduledStreamAnnouncement, 'id' | 'createdAt' | 'status'>,
): Promise<ScheduledStreamAnnouncement> {
    const savedAnnouncement: ScheduledStreamAnnouncement = {
        ...announcement,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'pending',
    };

    getScheduledStreamAnnouncements().push(savedAnnouncement);

    await db.write();

    return savedAnnouncement;
}

export function getDueScheduledStreamAnnouncements(
    now = new Date(),
): ScheduledStreamAnnouncement[] {
    return getScheduledStreamAnnouncements()
        .filter(announcement =>
            announcement.status === 'pending' &&
            new Date(announcement.sendAt).getTime() <= now.getTime(),
        )
        .sort((a, b) =>
            new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime(),
        );
}

export async function markScheduledStreamAnnouncementSent(
    id: string,
): Promise<void> {
    const announcement =
        getScheduledStreamAnnouncements().find(item => item.id === id);

    if (!announcement) {
        return;
    }

    announcement.status = 'sent';
    announcement.sentAt = new Date().toISOString();
    delete announcement.error;

    await db.write();
}

export async function markScheduledStreamAnnouncementFailed(
    id: string,
    error: string,
): Promise<void> {
    const announcement =
        getScheduledStreamAnnouncements().find(item => item.id === id);

    if (!announcement) {
        return;
    }

    announcement.status = 'failed';
    announcement.error = error;

    await db.write();
}
