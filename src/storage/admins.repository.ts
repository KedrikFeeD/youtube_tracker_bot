import type { StoredAdmin } from '../domain/types.js';
import { db, getAdmins } from './database.js';

export function isAdmin(userId: number): boolean {
    return getAdmins().some(admin => admin.id === userId);
}

export async function addAdmin(
    admin: Omit<StoredAdmin, 'addedAt'>,
): Promise<boolean> {
    if (isAdmin(admin.id)) {
        return false;
    }

    getAdmins().push({
        ...admin,
        addedAt: new Date().toISOString(),
    });

    await db.write();

    return true;
}
