import { Markup } from 'telegraf';
import {
    adminButtonText,
    cancelButtonText,
    confirmButtonText,
    scheduleStreamButtonText,
} from './buttons.js';

export function getMainKeyboard(isUserAdmin: boolean) {
    if (isUserAdmin) {
        return Markup.keyboard([[scheduleStreamButtonText]]).resize();
    }

    return Markup.keyboard([[adminButtonText]]).resize();
}

export function getCancelKeyboard() {
    return Markup.keyboard([[cancelButtonText]]).resize();
}

export function getConfirmKeyboard() {
    return Markup.keyboard([[confirmButtonText], [cancelButtonText]]).resize();
}
