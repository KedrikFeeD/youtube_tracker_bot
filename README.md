# YouTube Telegram Bot

Telegram-бот для автоматической публикации новых видео, запланированных трансляций и активных трансляций с YouTube-канала в Telegram-канал.

## Возможности

- Публикация новых видео с YouTube
- Публикация запланированных трансляций
- Публикация начала трансляций
- Защита от повторных публикаций
- Хранение истории публикаций в локальной базе (`lowdb`)
- Автоматический деплой на VPS через GitHub Actions
- Работа в фоне через PM2

## Технологии

- TypeScript
- Node.js
- YouTube Data API v3
- Telegram Bot API
- lowdb
- PM2
- GitHub Actions

---

## Установка

### 1. Клонирование репозитория

```bash
git clone https://github.com/KedrikFeeD/youtube_tracker_bot.git
cd youtube_tracker_bot
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Создание `.env`

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

---

## Конфигурация

### Пример `.env`

```env
# Telegram proxy
TELEGRAM_PROXY_URL=

# Telegram bot token from @BotFather
TELEGRAM_BOT_TOKEN=

# Telegram channel id (-100...)
TELEGRAM_CHANNEL_ID=

# YouTube Data API v3 key
YOUTUBE_API_KEY=

# YouTube channel id (starts with UC...)
YOUTUBE_CHANNEL_ID=

# Cron expression
CHECK_CRON=*/1 * * * *
```

---

## Получение необходимых данных

### TELEGRAM_BOT_TOKEN

Создать бота через:

https://t.me/BotFather

Команда:

```text
/newbot
```

После создания BotFather выдаст токен.

---

### TELEGRAM_CHANNEL_ID

1. Добавить бота в канал
2. Выдать права администратора
3. Использовать сервисы вроде:

https://t.me/userinfobot

или получить ID программно через Telegram API.

ID канала обычно выглядит так:

```text
-1001234567890
```

---

### YOUTUBE_API_KEY

1. Создать проект в Google Cloud Console
2. Включить YouTube Data API v3
3. Создать API Key

Документация:

https://console.cloud.google.com/

---

### YOUTUBE_CHANNEL_ID

Получить можно через API:

```bash
curl "https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=@yourhandle&key=YOUR_API_KEY"
```

Пример:

```text
UCxxxxxxxxxxxxxxxxxxxxxx
```

---

## Запуск

### Режим разработки

```bash
npm run dev
```

### Сборка

```bash
npm run build
```

### Продакшен

```bash
npm start
```

---

## Работа через PM2

Установка:

```bash
npm install -g pm2
```

Запуск:

```bash
pm2 start dist/index.js --name youtube-tracker-bot
```

Просмотр логов:

```bash
pm2 logs youtube-tracker-bot
```

Перезапуск:

```bash
pm2 restart youtube-tracker-bot
```

Сохранение конфигурации:

```bash
pm2 save
```

Автозапуск после перезагрузки:

```bash
pm2 startup
```

---

## CI/CD

Репозиторий поддерживает автоматический деплой через GitHub Actions.

При каждом пуше в ветку `master` выполняются:

1. Подключение к VPS по SSH
2. `git pull`
3. `npm ci`
4. `npm run build`
5. Перезапуск PM2

Для работы необходимо добавить GitHub Secrets:

| Secret | Описание |
|----------|----------|
| VPS_HOST | IP сервера |
| VPS_USER | Пользователь сервера |
| VPS_SSH_KEY | Приватный SSH-ключ |

---

## Лицензия

MIT

---

## Автор

GitHub: https://github.com/KedrikFeeD