import type { Context } from 'telegraf';
import { formatMoscowDateTime, parseMoscowDateTime } from '../../shared/date-time.js';
import { normalizeHttpUrl } from '../../shared/url.js';
import { isAdmin } from '../../storage/admins.repository.js';
import { addScheduledStreamAnnouncement } from '../../storage/scheduled-announcements.repository.js';
import { buildScheduledStreamAnnouncementMessage } from '../messages/scheduled-stream.message.js';
import { cancelButtonText, confirmButtonText } from '../ui/buttons.js';
import {
    getCancelKeyboard,
    getConfirmKeyboard,
    getMainKeyboard,
} from '../ui/keyboards.js';

type ScheduleStreamStep = 'title' | 'url' | 'streamStartAt' | 'sendAt' | 'confirm';

interface ScheduleStreamDraft {
    step: ScheduleStreamStep;
    title?: string;
    url?: string;
    streamStartAt?: string;
    sendAt?: string;
}

const pendingStreamScheduleDrafts = new Map<number, ScheduleStreamDraft>();

export function clearPendingStreamSchedule(userId: number): void {
    pendingStreamScheduleDrafts.delete(userId);
}

export async function startScheduleStream(ctx: Context): Promise<void> {
    const userId = ctx.from?.id;

    if (!userId) {
        return;
    }

    if (ctx.chat?.type !== 'private') {
        await ctx.reply('Планирование стримов доступно только в личном чате с ботом.');
        return;
    }

    if (!isAdmin(userId)) {
        await ctx.reply(
            'Сначала подтвердите, что вы администратор.',
            getMainKeyboard(false),
        );
        return;
    }

    pendingStreamScheduleDrafts.set(userId, {
        step: 'title',
    });

    await ctx.reply(
        'Введите название стрима.',
        getCancelKeyboard(),
    );
}

export async function handleStreamScheduleText(
    ctx: Context & { message: { text: string } },
): Promise<boolean> {
    const userId = ctx.from?.id;

    if (!userId) {
        return false;
    }

    const draft = pendingStreamScheduleDrafts.get(userId);

    if (!draft) {
        return false;
    }

    const text = ctx.message.text.trim();

    if (text.toLowerCase() === cancelButtonText.toLowerCase()) {
        clearPendingStreamSchedule(userId);
        await ctx.reply('Действие отменено.', getMainKeyboard(isAdmin(userId)));
        return true;
    }

    if (draft.step === 'title') {
        await handleTitleStep(ctx, draft, text);
        return true;
    }

    if (draft.step === 'url') {
        await handleUrlStep(ctx, draft, text);
        return true;
    }

    if (draft.step === 'streamStartAt') {
        await handleStreamStartStep(ctx, draft, text);
        return true;
    }

    if (draft.step === 'sendAt') {
        await handleSendAtStep(ctx, draft, text);
        return true;
    }

    if (draft.step === 'confirm') {
        await handleConfirmStep(ctx, draft, text, userId);
        return true;
    }

    return false;
}

async function handleTitleStep(
    ctx: Context,
    draft: ScheduleStreamDraft,
    text: string,
): Promise<void> {
    if (!text || text.length > 200) {
        await ctx.reply('Введите название от 1 до 200 символов.');
        return;
    }

    draft.title = text;
    draft.step = 'url';

    await ctx.reply('Отправьте ссылку на стрим.');
}

async function handleUrlStep(
    ctx: Context,
    draft: ScheduleStreamDraft,
    text: string,
): Promise<void> {
    const url = normalizeHttpUrl(text);

    if (!url) {
        await ctx.reply('Отправьте корректную ссылку, начинающуюся с http:// или https://.');
        return;
    }

    draft.url = url;
    draft.step = 'streamStartAt';

    await ctx.reply('Когда начнется стрим? Например: 20:00, завтра 20:00 или 13.09.2026 20:00.');
}

async function handleStreamStartStep(
    ctx: Context,
    draft: ScheduleStreamDraft,
    text: string,
): Promise<void> {
    const streamStartAt = parseMoscowDateTime(text);

    if (!streamStartAt || streamStartAt.getTime() <= Date.now()) {
        await ctx.reply('Введите будущее время начала стрима в МСК. Например: завтра 20:00.');
        return;
    }

    draft.streamStartAt = streamStartAt.toISOString();
    draft.step = 'sendAt';

    await ctx.reply('Когда отправить уведомление в канал? Например: 09:00 или завтра 09:00.');
}

async function handleSendAtStep(
    ctx: Context,
    draft: ScheduleStreamDraft,
    text: string,
): Promise<void> {
    const sendAt = parseMoscowDateTime(text);

    if (!sendAt || sendAt.getTime() <= Date.now()) {
        await ctx.reply('Введите будущее время отправки уведомления в МСК.');
        return;
    }

    if (draft.streamStartAt && sendAt.getTime() > new Date(draft.streamStartAt).getTime()) {
        await ctx.reply('Уведомление должно быть запланировано не позже начала стрима.');
        return;
    }

    draft.sendAt = sendAt.toISOString();
    draft.step = 'confirm';

    await ctx.reply(
        [
            '<b>Проверьте уведомление</b>',
            '',
            buildScheduledStreamAnnouncementMessage({
                title: draft.title!,
                url: draft.url!,
                streamStartAt: draft.streamStartAt!,
            }),
            '',
            `Отправить в канал: ${formatMoscowDateTime(draft.sendAt)} МСК`,
        ].join('\n'),
        {
            parse_mode: 'HTML',
            ...getConfirmKeyboard(),
        },
    );
}

async function handleConfirmStep(
    ctx: Context,
    draft: ScheduleStreamDraft,
    text: string,
    userId: number,
): Promise<void> {
    if (text.toLowerCase() !== confirmButtonText.toLowerCase()) {
        await ctx.reply('Нажмите "Подтвердить" или "Отмена".');
        return;
    }

    const announcement = await addScheduledStreamAnnouncement({
        title: draft.title!,
        url: draft.url!,
        streamStartAt: draft.streamStartAt!,
        sendAt: draft.sendAt!,
        createdBy: userId,
    });

    pendingStreamScheduleDrafts.delete(userId);

    await ctx.reply(
        `Готово. Уведомление запланировано на ${formatMoscowDateTime(announcement.sendAt)} МСК.`,
        getMainKeyboard(true),
    );
}
