import type {YoutubeItem} from "../youtube.js";

export function isShort(item: YoutubeItem): boolean {
    return item.title
        .toLowerCase()
        .includes('#shorts');
}