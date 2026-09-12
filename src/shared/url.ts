export function normalizeHttpUrl(value: string): string | null {
    try {
        const url = new URL(value.trim());

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null;
        }

        return url.toString();
    } catch {
        return null;
    }
}
