import 'dotenv/config';
import {
    launchBot,
    registerBotShutdownHooks,
} from './telegram/bot.js';
import { registerTelegramHandlers } from './telegram/register-handlers.js';
import {
    runInitialChecks,
    startSchedulers,
} from './scheduler/index.js';

registerTelegramHandlers();
registerBotShutdownHooks();
startSchedulers();
runInitialChecks();

launchBot().catch(error => {
    console.error('Telegram bot polling failed:', error);
});
