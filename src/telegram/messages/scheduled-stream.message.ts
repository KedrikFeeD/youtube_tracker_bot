import type { ScheduledStreamAnnouncement } from '../../domain/types.js';
import { formatMoscowDateTime } from '../../shared/date-time.js';
import {
    escapeHtml,
    escapeHtmlAttribute,
} from '../../shared/html.js';

export function buildScheduledStreamAnnouncementMessage(
    announcement: Pick<ScheduledStreamAnnouncement, 'title' | 'url' | 'streamStartAt'>,
): string {
    const streamStartAt = formatMoscowDateTime(announcement.streamStartAt);

    return [
        '<b>📅 Запланирована трансляция</b>',
        '',
        `<b>${escapeHtml(announcement.title)}</b>`,
        '',
        streamStartAt ? `🕒 Начало: ${streamStartAt} МСК` : null,
        '',
        `🔗 <a href="${escapeHtmlAttribute(announcement.url)}">Смотреть трансляцию</a>`,
    ]
        .filter((line): line is string => line !== null)
        .join('\n');
}
