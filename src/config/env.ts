function getRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new Error(`${name} is not set`);
    }

    return value;
}

function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();

    return value || undefined;
}

export const telegramConfig = {
    token: getRequiredEnv('TELEGRAM_BOT_TOKEN'),
    channelId: getRequiredEnv('TELEGRAM_CHANNEL_ID'),
    proxyEnabled: process.env.TELEGRAM_PROXY_ENABLED === 'true',
    proxyUrl: getOptionalEnv('TELEGRAM_PROXY_URL'),
};

if (telegramConfig.proxyEnabled && !telegramConfig.proxyUrl) {
    throw new Error(
        'TELEGRAM_PROXY_URL is required when TELEGRAM_PROXY_ENABLED=true',
    );
}

export const youtubeConfig = {
    apiKey: getRequiredEnv('YOUTUBE_API_KEY'),
    channelId: getRequiredEnv('YOUTUBE_CHANNEL_ID'),
};

export const adminConfig = {
    password: getOptionalEnv('ADMIN_PASSWORD'),
};

export const schedulerConfig = {
    youtubeCheckCron: process.env.CHECK_CRON ?? '*/1 * * * *',
    scheduledAnnouncementsCron:
        process.env.SCHEDULED_ANNOUNCEMENTS_CRON ?? '*/1 * * * *',
};
