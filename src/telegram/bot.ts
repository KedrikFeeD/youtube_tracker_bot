import { Telegraf } from 'telegraf';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { telegramConfig } from '../config/env.js';

const telegramOptions = telegramConfig.proxyEnabled
    ? {
        telegram: {
            agent: new SocksProxyAgent(telegramConfig.proxyUrl!),
        },
    }
    : undefined;

export const bot = new Telegraf(telegramConfig.token, telegramOptions);

export async function launchBot(): Promise<void> {
    await bot.launch();
    console.log('Telegram bot polling started.');
}

export function registerBotShutdownHooks(): void {
    process.once('SIGINT', () => {
        bot.stop('SIGINT');
    });

    process.once('SIGTERM', () => {
        bot.stop('SIGTERM');
    });
}
