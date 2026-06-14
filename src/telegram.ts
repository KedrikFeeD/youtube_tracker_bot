import { Telegraf } from 'telegraf';
import { SocksProxyAgent } from 'socks-proxy-agent';
import type { YoutubeItem } from './youtube.js';
import { EVideoType } from './enums/video-type.enums.js';

const token = process.env.TELEGRAM_BOT_TOKEN;
const channelId = process.env.TELEGRAM_CHANNEL_ID;
const proxyUrl = process.env.TELEGRAM_PROXY_URL;

if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

if (!channelId) {
    throw new Error('TELEGRAM_CHANNEL_ID is not set');
}

const telegramOptions = proxyUrl
    ? {
        telegram: {
            agent: new SocksProxyAgent(proxyUrl),
        },
    }
    : undefined;

export const bot = new Telegraf(token, telegramOptions);

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

function formatDateTime(value?: string): string | null {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString('ru-RU', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Europe/Moscow',
    });
}

function getExtraMessageLines(item: YoutubeItem): string[] {
    if (item.type === EVideoType.UpcomingLive) {
        const scheduledStartTime =
            formatDateTime(item.scheduledStartTime);

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
            return `🔗 <a href="${item.url}">Смотреть видео на YouTube</a>`
        case EVideoType.UpcomingLive:
        case EVideoType.Live:
            return `🔗 <a href="${item.url}">YouTube</a> | <a href="https://www.twitch.tv/kedrikroot">Twitch</a>`
        default:
            return `🔗 <a href="${item.url}">Смотреть видео на YouTube</a>`
    }
}

export async function postToTelegram(item: YoutubeItem): Promise<void> {
    const extraLines = getExtraMessageLines(item);

    const text = [
        `<b>${getTitle(item.type)}</b>`,
        '',
        `<b>${escapeHtml(item.title)}</b>`,
        '',
        ...extraLines,
        `${getPreparedMessageLinks(item)}`,
    ].join('\n');

    await bot.telegram.sendMessage(channelId!, text, {
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