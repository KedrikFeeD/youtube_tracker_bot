import { Telegraf } from 'telegraf';
import type { YoutubeItem } from './youtube.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;

if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

if (!channelId) {
    throw new Error('TELEGRAM_CHANNEL_ID is not set');
}

export const bot = new Telegraf(token);

function getTitle(type: YoutubeItem['type']): string {
    switch (type) {
        case 'video':
            return 'Новое видео';
        case 'upcoming_live':
            return 'Запланирована трансляция';
        case 'live':
            return 'Трансляция началась';
    }
}

export async function postToTelegram(item: YoutubeItem): Promise<void> {
    if (!channelId) {
        throw new Error('channelId must be provided');
    }

    const text = [
        `<b>${getTitle(item.type)}</b>`,
        '',
        `<b>${escapeHtml(item.title)}</b>`,
        '',
        item.url,
    ].join('\n');

    await bot.telegram.sendMessage(channelId, text, {
        parse_mode: 'HTML',
        link_preview_options: {
            is_disabled: false,
        },
    });
}

function escapeHtml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}