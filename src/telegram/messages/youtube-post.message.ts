import { EVideoType } from '../../enums/video-type.enums.js';
import { formatMoscowDateTime } from '../../shared/date-time.js';
import { escapeHtml } from '../../shared/html.js';
import type { YoutubeItem } from '../../youtube.js';

function getTitle(type: YoutubeItem['type']): string {
    switch (type) {
        case EVideoType.Video:
            return '🎬 Новое видео';
        case EVideoType.UpcomingLive:
            return '📅 Запланирована трансляция';
        case EVideoType.Live:
            return '🔴 Трансляция началась!';
        default:
            return '';
    }
}

function getExtraMessageLines(item: YoutubeItem): string[] {
    if (item.type === EVideoType.UpcomingLive) {
        const scheduledStartTime =
            formatMoscowDateTime(item.scheduledStartTime);

        if (!scheduledStartTime) {
            return [];
        }

        return [
            `🕒 Начало: ${scheduledStartTime} МСК`,
            '',
        ];
    }

    return [];
}

function getPreparedMessageLinks(item: YoutubeItem): string {
    switch (item.type) {
        case EVideoType.Video:
            return `🔗 <a href="${item.url}">Смотреть видео на YouTube</a>`;
        case EVideoType.UpcomingLive:
        case EVideoType.Live:
            return `🔗 <a href="${item.url}">YouTube</a> | <a href="https://www.twitch.tv/kedrikroot">Twitch</a>`;
        default:
            return `🔗 <a href="${item.url}">Смотреть видео на YouTube</a>`;
    }
}

export function buildYoutubePostMessage(item: YoutubeItem): string {
    const extraLines = getExtraMessageLines(item);

    return [
        `<b>${getTitle(item.type)}</b>`,
        '',
        `<b>${escapeHtml(item.title)}</b>`,
        '',
        ...extraLines,
        getPreparedMessageLinks(item),
    ].join('\n');
}
