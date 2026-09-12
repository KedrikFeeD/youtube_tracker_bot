import { telegramConfig } from '../config/env.js';
import type { ScheduledStreamAnnouncement } from '../domain/types.js';
import type { YoutubeItem } from '../youtube.js';
import { bot } from './bot.js';
import { buildScheduledStreamAnnouncementMessage } from './messages/scheduled-stream.message.js';
import { buildYoutubePostMessage } from './messages/youtube-post.message.js';

const messageOptions = {
    parse_mode: 'HTML' as const,
    link_preview_options: {
        is_disabled: false,
    },
};

export async function postToTelegram(item: YoutubeItem): Promise<void> {
    await bot.telegram.sendMessage(
        telegramConfig.channelId,
        buildYoutubePostMessage(item),
        messageOptions,
    );
}

export async function postScheduledStreamAnnouncement(
    announcement: ScheduledStreamAnnouncement,
): Promise<void> {
    await bot.telegram.sendMessage(
        telegramConfig.channelId,
        buildScheduledStreamAnnouncementMessage(announcement),
        messageOptions,
    );
}
