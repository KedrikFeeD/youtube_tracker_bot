const moscowTimeZone = 'Europe/Moscow';
const moscowUtcOffsetHours = 3;

function getMoscowDateParts(value = new Date()): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
} {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: moscowTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(value);

    const getPart = (type: string): number => {
        const part = parts.find(item => item.type === type);

        return part ? Number(part.value) : 0;
    };

    return {
        year: getPart('year'),
        month: getPart('month'),
        day: getPart('day'),
        hour: getPart('hour'),
        minute: getPart('minute'),
    };
}

function createDateFromMoscowParts(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
): Date | null {
    if (
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {
        return null;
    }

    const date = new Date(Date.UTC(
        year,
        month - 1,
        day,
        hour - moscowUtcOffsetHours,
        minute,
    ));

    const parts = getMoscowDateParts(date);

    if (
        parts.year !== year ||
        parts.month !== month ||
        parts.day !== day ||
        parts.hour !== hour ||
        parts.minute !== minute
    ) {
        return null;
    }

    return date;
}

function addMoscowDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function formatMoscowDateTime(value?: string): string | null {
    if (!value) {
        return null;
    }

    return new Date(value).toLocaleString('ru-RU', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: moscowTimeZone,
    });
}

export function parseMoscowDateTime(value: string): Date | null {
    const normalized = value
        .trim()
        .toLowerCase()
        .replace(',', ' ')
        .replace(/\s+/g, ' ');

    const now = new Date();
    const today = getMoscowDateParts(now);
    const timeOnlyMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);

    if (timeOnlyMatch) {
        const hour = Number(timeOnlyMatch[1]);
        const minute = Number(timeOnlyMatch[2]);
        let date = createDateFromMoscowParts(
            today.year,
            today.month,
            today.day,
            hour,
            minute,
        );

        if (date && date.getTime() <= now.getTime()) {
            date = addMoscowDays(date, 1);
        }

        return date;
    }

    const relativeMatch =
        normalized.match(/^(сегодня|завтра)\s+(\d{1,2}):(\d{2})$/);

    if (relativeMatch) {
        const dayOffset = relativeMatch[1] === 'завтра' ? 1 : 0;
        const hour = Number(relativeMatch[2]);
        const minute = Number(relativeMatch[3]);
        const date = createDateFromMoscowParts(
            today.year,
            today.month,
            today.day,
            hour,
            minute,
        );

        return date ? addMoscowDays(date, dayOffset) : null;
    }

    const dateTimeMatch =
        normalized.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{2}|\d{4}))?\s+(\d{1,2}):(\d{2})$/);

    if (!dateTimeMatch) {
        return null;
    }

    const day = Number(dateTimeMatch[1]);
    const month = Number(dateTimeMatch[2]);
    const inputYear = dateTimeMatch[3];
    const hour = Number(dateTimeMatch[4]);
    const minute = Number(dateTimeMatch[5]);
    let year = inputYear
        ? Number(inputYear.length === 2 ? `20${inputYear}` : inputYear)
        : today.year;
    let date = createDateFromMoscowParts(year, month, day, hour, minute);

    if (!date) {
        return null;
    }

    if (!inputYear && date.getTime() <= now.getTime()) {
        year += 1;
        date = createDateFromMoscowParts(year, month, day, hour, minute);
    }

    return date;
}
