import type { Context } from 'telegraf';
import { isAdmin } from '../storage/admins.repository.js';
import { bot } from './bot.js';
import {
    askAdminPassword,
    clearPendingAdminAuth,
    handleAdminAuthText,
} from './handlers/admin-auth.handler.js';
import {
    clearPendingStreamSchedule,
    handleStreamScheduleText,
    startScheduleStream,
} from './handlers/schedule-stream.handler.js';
import {
    adminButtonText,
    cancelButtonText,
    scheduleStreamButtonText,
} from './ui/buttons.js';
import { getMainKeyboard } from './ui/keyboards.js';

export function registerTelegramHandlers(): void {
    bot.start(async ctx => {
        const userId = ctx.from?.id;

        await ctx.reply(
            'Выберите действие.',
            getMainKeyboard(userId ? isAdmin(userId) : false),
        );
    });

    bot.command('admin', askAdminPassword);
    bot.command('schedule_stream', startScheduleStream);
    bot.command('cancel', cancelUserAction);

    bot.hears(new RegExp(`^${adminButtonText}$`, 'i'), askAdminPassword);
    bot.hears(new RegExp(`^${scheduleStreamButtonText}$`, 'i'), startScheduleStream);
    bot.hears(new RegExp(`^${cancelButtonText}$`, 'i'), cancelUserAction);

    bot.on('text', async ctx => {
        if (await handleStreamScheduleText(ctx)) {
            return;
        }

        await handleAdminAuthText(ctx);
    });
}

async function cancelUserAction(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;

    if (userId) {
        clearPendingAdminAuth(userId);
        clearPendingStreamSchedule(userId);
    }

    await ctx.reply(
        'Действие отменено.',
        getMainKeyboard(userId ? isAdmin(userId) : false),
    );
}
