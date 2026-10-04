/** Exact musical coordinates, in quarter-note units. No store/UI dependencies. */
export type Q = { numerator: number; denominator: number };

const gcd = (a: bigint, b: bigint): bigint => {
    a = a < 0n ? -a : a;
    while (b !== 0n) [a, b] = [b, a % b];
    return a;
};

const make = (n: bigint, d: bigint): Q => {
    if (d === 0n) throw new Error("Zero rational denominator.");
    if (d < 0n) [n, d] = [-n, -d];
    const divisor = gcd(n, d);
    const numerator = Number(n / divisor);
    const denominator = Number(d / divisor);
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
        throw new Error("Musical coordinate exceeds the exact integer range.");
    }
    return { numerator, denominator };
};

export const q = (numerator: number, denominator = 1): Q => {
    if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
        throw new Error("Rational components must be safe integers.");
    }
    return make(BigInt(numerator), BigInt(denominator));
};

export const fromNumber = (value: number): Q => {
    if (!Number.isFinite(value)) throw new Error("Non-finite musical coordinate.");
    const [mantissa, exponentText = "0"] = value.toString().toLowerCase().split("e");
    const decimals = mantissa.split(".")[1]?.length ?? 0;
    const exponent = Number(exponentText) - decimals;
    if (Math.abs(exponent) > 15) throw new Error("Musical coordinate precision is unsupported.");
    const n = BigInt(mantissa.replace(".", ""));
    return exponent >= 0 ? make(n * 10n ** BigInt(exponent), 1n) : make(n, 10n ** BigInt(-exponent));
};

export const addQ = (a: Q, b: Q): Q => make(
    BigInt(a.numerator) * BigInt(b.denominator) + BigInt(b.numerator) * BigInt(a.denominator),
    BigInt(a.denominator) * BigInt(b.denominator),
);
export const subQ = (a: Q, b: Q): Q => addQ(a, { ...b, numerator: -b.numerator });
export const mulQ = (a: Q, b: Q): Q => make(BigInt(a.numerator) * BigInt(b.numerator), BigInt(a.denominator) * BigInt(b.denominator));
export const divQ = (a: Q, b: Q): Q => make(BigInt(a.numerator) * BigInt(b.denominator), BigInt(a.denominator) * BigInt(b.numerator));
export const compareQ = (a: Q, b: Q): number => {
    const delta = BigInt(a.numerator) * BigInt(b.denominator) - BigInt(b.numerator) * BigInt(a.denominator);
    return delta < 0n ? -1 : delta > 0n ? 1 : 0;
};
export const minQ = (a: Q, b: Q): Q => compareQ(a, b) <= 0 ? a : b;
export const maxQ = (a: Q, b: Q): Q => compareQ(a, b) >= 0 ? a : b;
export const floorQ = (a: Q): number => {
    const n = BigInt(a.numerator), d = BigInt(a.denominator);
    return Number(n >= 0n ? n / d : (n - d + 1n) / d);
};
export const ZERO_Q = q(0);
export type QRange = { startQ: Q; endQ: Q };
export const intersectQ = (a: QRange, b: QRange): QRange | null => {
    const startQ = maxQ(a.startQ, b.startQ), endQ = minQ(a.endQ, b.endQ);
    return compareQ(startQ, endQ) < 0 ? { startQ, endQ } : null;
};

export const noteRangeQ = (note: { norm: { div: number; tuplets?: number }; pos: number; len: number }): QRange => {
    const divisor = mulQ(fromNumber(note.norm.div), fromNumber(note.norm.tuplets ?? 1));
    if (compareQ(divisor, ZERO_Q) <= 0 || note.len <= 0) throw new Error("Invalid note duration/unit.");
    const startQ = divQ(fromNumber(note.pos), divisor);
    return { startQ, endQ: addQ(startQ, divQ(fromNumber(note.len), divisor)) };
};
