import type { Context } from 'telegraf';
import { adminConfig } from '../../config/env.js';
import {
    addAdmin,
    isAdmin,
} from '../../storage/admins.repository.js';
import { getMainKeyboard } from '../ui/keyboards.js';

const pendingAdminAuthUserIds = new Set<number>();

export function clearPendingAdminAuth(userId: number): void {
    pendingAdminAuthUserIds.delete(userId);
}

export async function askAdminPassword(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;

    if (!userId) {
        return;
    }

    if (ctx.chat?.type !== 'private') {
        await ctx.reply('Авторизация администратора доступна только в личном чате с ботом.');
        return;
    }

    if (isAdmin(userId)) {
        await ctx.reply(`Вы уже сохранены как администратор. Ваш ID: ${userId}`);
        return;
    }

    if (!adminConfig.password) {
        await ctx.reply('Пароль администратора не настроен. Добавьте ADMIN_PASSWORD в .env и перезапустите бота.');
        return;
    }

    pendingAdminAuthUserIds.add(userId);

    await ctx.reply('Введите пароль администратора.');
}

export async function handleAdminAuthText(
    ctx: Context & { message: { text: string } },
): Promise<boolean> {
    const user = ctx.from;

    if (!user || !pendingAdminAuthUserIds.has(user.id)) {
        return false;
    }

    if (!adminConfig.password) {
        pendingAdminAuthUserIds.delete(user.id);
        await ctx.reply('Пароль администратора не настроен. Добавьте ADMIN_PASSWORD в .env и перезапустите бота.');
        return true;
    }

    try {
        await ctx.deleteMessage();
    } catch {
        // The password message may be impossible to delete depending on chat permissions.
    }

    if (ctx.message.text.trim() !== adminConfig.password) {
        await ctx.reply('Неверный пароль. Попробуйте еще раз или отправьте /cancel.');
        return true;
    }

    pendingAdminAuthUserIds.delete(user.id);

    await addAdmin({
        id: user.id,
        ...(user.username ? { username: user.username } : {}),
        ...(user.first_name ? { firstName: user.first_name } : {}),
        ...(user.last_name ? { lastName: user.last_name } : {}),
    });

    await ctx.reply(
        `Готово. Вы добавлены как администратор. Ваш ID: ${user.id}`,
        getMainKeyboard(true),
    );

    return true;
}
