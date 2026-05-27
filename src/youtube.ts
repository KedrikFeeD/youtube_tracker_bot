import axios from 'axios';
import type { YoutubePostType } from './types.js';

const apiKey = process.env.YOUTUBE_API_KEY;
const channelId = process.env.YOUTUBE_CHANNEL_ID;

if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not set');
}

if (!channelId) {
    throw new Error('YOUTUBE_CHANNEL_ID is not set');
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

interface PlaylistItemResponse {
    items: Array<{
        snippet: {
            title: string;
            description: string;
            publishedAt: string;
            channelTitle: string;
            resourceId: {
                videoId: string;
            };
        };
    }>;
}

interface VideosResponse {
    items: Array<{
        id: string;
        snippet: {
            liveBroadcastContent?: 'none' | 'upcoming' | 'live';
        };
        liveStreamingDetails?: {
            scheduledStartTime?: string;
            actualStartTime?: string;
        };
    }>;
}

async function getUploadsPlaylistId(): Promise<string> {
    const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
            params: {
                key: apiKey,
                id: channelId,
                part: 'contentDetails',
            },
        },
    );

    const playlistId =
        response.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!playlistId) {
        throw new Error('Uploads playlist not found');
    }

    return playlistId;
}

async function getPlaylistItems(): Promise<YoutubeItem[]> {
    const playlistId = await getUploadsPlaylistId();

    const response = await axios.get<PlaylistItemResponse>(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
            params: {
                key: apiKey,
                playlistId,
                part: 'snippet',
                maxResults: 10,
            },
        },
    );

    return response.data.items.map(item => {
        const videoId = item.snippet.resourceId.videoId;

        return {
            videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            channelTitle: item.snippet.channelTitle,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            type: 'video',
        };
    });
}

async function enrichVideoTypes(
    items: YoutubeItem[],
): Promise<YoutubeItem[]> {
    const ids = items
        .map(item => item.videoId)
        .join(',');

    const response = await axios.get<VideosResponse>(
        'https://www.googleapis.com/youtube/v3/videos',
        {
            params: {
                key: apiKey,
                id: ids,
                part: 'snippet,liveStreamingDetails',
            },
        },
    );

    const map = new Map(
        response.data.items.map(item => [
            item.id,
            item,
        ]),
    );

    return items.map(item => {
        const details = map.get(item.videoId);

        const broadcast =
            details?.snippet.liveBroadcastContent;

        if (broadcast === 'upcoming') {
            return {
                ...item,
                type: 'upcoming_live',
            };
        }

        if (broadcast === 'live') {
            return {
                ...item,
                type: 'live',
            };
        }

        return {
            ...item,
            type: 'video',
        };
    });
}

export async function getYoutubeItems(): Promise<YoutubeItem[]> {
    const items = await getPlaylistItems();

    return enrichVideoTypes(items);
}