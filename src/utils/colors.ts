/**
 * Generates a deterministic Hex color for a given string (e.g. subject ID).
 * Returns a CSS Hex string like "#ABCDEF".
 */
export const stringToColor = (str: string): { bg: string, border: string } => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash % 360);
    // Pastel background (Lightness ~90%, Saturation ~85%)
    // Use a helper to convert HSL to Hex
    const bg = hslToHex(h, 85, 92);
    const border = hslToHex(h, 60, 80);

    return { bg, border };
};

// Start H S L [0..360, 0..100, 0..100]
function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
