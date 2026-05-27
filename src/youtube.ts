import axios from 'axios';
import type { YoutubePostType } from './types.ts';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YoutubeSearchItem {
    id: {
        videoId?: string;
    };
    snippet: {
        title: string;
        description: string;
        publishedAt: string;
        channelTitle: string;
        liveBroadcastContent?: 'none' | 'upcoming' | 'live';
    };
}

export interface YoutubeItem {
    videoId: string;
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    url: string;
    type: YoutubePostType;
}

const apiKey = process.env.YOUTUBE_API_KEY;
const channelId = process.env.YOUTUBE_CHANNEL_ID;

if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
}

if (!channelId) {
    throw new Error('YOUTUBE_CHANNEL_ID is not set');
}

async function searchYoutube(params: Record<string, string | number>): Promise<YoutubeSearchItem[]> {
    const response = await axios.get(YOUTUBE_API_URL, {
        params: {
            key: apiKey,
            channelId,
            part: 'snippet',
            maxResults: 10,
            order: 'date',
            type: 'video',
            ...params,
        },
    });

    return response.data.items ?? [];
}

function mapItem(item: YoutubeSearchItem, type: YoutubePostType): YoutubeItem | null {
    const videoId = item.id.videoId;

    if (!videoId) {
        return null;
    }

    return {
        videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        type,
    };
}

export async function getLatestVideos(): Promise<YoutubeItem[]> {
    const items = await searchYoutube({});

    return items
        .filter(item => item.snippet.liveBroadcastContent === 'none')
        .map(item => mapItem(item, 'video'))
        .filter(Boolean) as YoutubeItem[];
}

export async function getUpcomingLives(): Promise<YoutubeItem[]> {
    const items = await searchYoutube({
        eventType: 'upcoming',
    });

    return items
        .map(item => mapItem(item, 'upcoming_live'))
        .filter(Boolean) as YoutubeItem[];
}

export async function getActiveLives(): Promise<YoutubeItem[]> {
    const items = await searchYoutube({
        eventType: 'live',
    });

    return items
        .map(item => mapItem(item, 'live'))
        .filter(Boolean) as YoutubeItem[];
}