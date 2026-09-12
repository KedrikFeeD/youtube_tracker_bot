import { JSONFilePreset } from 'lowdb/node';
import type { Low } from 'lowdb';
import type {
    DbSchema,
    ScheduledStreamAnnouncement,
    StoredAdmin,
} from '../domain/types.js';

const defaultData: DbSchema = {
    posted: [],
    admins: [],
    scheduledStreamAnnouncements: [],
};

export const db: Low<DbSchema> = await JSONFilePreset<DbSchema>(
    'db.json',
    defaultData,
);

export function getAdmins(): StoredAdmin[] {
    db.data.admins ??= [];

    return db.data.admins;
}

export function getScheduledStreamAnnouncements(): ScheduledStreamAnnouncement[] {
    db.data.scheduledStreamAnnouncements ??= [];

    return db.data.scheduledStreamAnnouncements;
}
