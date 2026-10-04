import { z } from "zod";

const integer = z.number().int().safe();
const rational = z.object({ numerator: integer, denominator: integer.positive() }).strict();
const ref = z.string().min(1).max(128);
const range = z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("all") }).strict(),
    z.object({ kind: z.literal("bars"), fromBar: integer.positive(), throughBar: integer.positive() }).strict(),
    z.object({ kind: z.literal("q"), startQ: rational, endQ: rational }).strict(),
    z.object({ kind: z.literal("section"), sectionRef: ref }).strict(),
    z.object({ kind: z.literal("chord"), chordRef: ref }).strict(),
    z.object({ kind: z.literal("selection"), source: z.enum(["melody", "outline"]) }).strict(),
]).refine(value => value.kind !== "bars" || value.fromBar <= value.throughBar, "fromBar must not exceed throughBar");

const page = { cursor: ref.optional(), limit: integer.min(1).max(128).optional() };
export const catalogSchema = z.object({ snapshotId: ref.optional(), ...page }).strict();
export const editorSchema = z.object({ snapshotId: ref.optional() }).strict();
const outline = {
    snapshotId: ref, range,
    context: z.object({ beforeBars: integer.min(0).max(16), afterBars: integer.min(0).max(16) }).strict().optional(),
    detail: z.enum(["standard", "harmonic"]).optional(), ...page,
};
export const outlineSchema = z.object(outline).strict();
export const musicalSchema = z.object({ ...outline,
    trackRefs: z.array(ref).min(1).max(16).refine(refs => new Set(refs).size === refs.length, "Track refs must be unique"),
    noteFilter: z.enum(["overlap", "onset"]).optional(),
}).strict();
