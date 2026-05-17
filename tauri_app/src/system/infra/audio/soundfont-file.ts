namespace SoundFontFile {
    export type Preset = {
        name: string;
        bank: number;
        program: number;
    };

    export type PresetKey = {
        bank: number;
        program: number;
    };

    const readAscii = (view: DataView, offset: number, length: number) => {
        let text = "";
        for (let i = 0; i < length; i++) {
            const code = view.getUint8(offset + i);
            if (code === 0) break;
            text += String.fromCharCode(code);
        }
        return text;
    };

    const findPdtaOffset = (view: DataView) => {
        if (readAscii(view, 0, 4) !== "RIFF" || readAscii(view, 8, 4) !== "sfbk") {
            throw new Error("The selected file is not a SoundFont bank.");
        }

        let offset = 12;
        while (offset + 12 <= view.byteLength) {
            const chunkId = readAscii(view, offset, 4);
            const chunkSize = view.getUint32(offset + 4, true);
            const chunkDataOffset = offset + 8;

            if (chunkId === "LIST") {
                const listType = readAscii(view, chunkDataOffset, 4);
                if (listType === "pdta") return {
                    offset: chunkDataOffset + 4,
                    end: chunkDataOffset + chunkSize,
                };
            }

            offset = chunkDataOffset + chunkSize + (chunkSize % 2);
        }

        throw new Error("The SoundFont preset data was not found.");
    };

    const findPhdrOffset = (view: DataView) => {
        const pdta = findPdtaOffset(view);
        let offset = pdta.offset;

        while (offset + 8 <= pdta.end) {
            const chunkId = readAscii(view, offset, 4);
            const chunkSize = view.getUint32(offset + 4, true);
            const chunkDataOffset = offset + 8;

            if (chunkId === "phdr") return {
                offset: chunkDataOffset,
                end: chunkDataOffset + chunkSize,
            };

            offset = chunkDataOffset + chunkSize + (chunkSize % 2);
        }

        throw new Error("The SoundFont preset header was not found.");
    };

    export const readPresets = (bytes: Uint8Array): Preset[] => {
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const phdr = findPhdrOffset(view);
        const recordSize = 38;
        const records = Math.floor((phdr.end - phdr.offset) / recordSize);
        const presets: Preset[] = [];

        for (let i = 0; i < records; i++) {
            const offset = phdr.offset + i * recordSize;
            const name = readAscii(view, offset, 20).trim();
            if (name === "EOP") continue;
            if (name === "") continue;

            presets.push({
                name,
                program: view.getUint16(offset + 20, true),
                bank: view.getUint16(offset + 22, true),
            });
        }

        return presets.sort((a, b) => {
            if (a.bank !== b.bank) return a.bank - b.bank;
            if (a.program !== b.program) return a.program - b.program;
            return a.name.localeCompare(b.name);
        });
    };

    export const formatPreset = (preset: Preset) => {
        const bank = preset.bank.toString().padStart(3, "0");
        const program = preset.program.toString().padStart(3, "0");
        return `${bank}:${program} ${preset.name}`;
    };

    export const formatPresetKey = (preset: PresetKey) => {
        const bank = preset.bank.toString().padStart(3, "0");
        const program = preset.program.toString().padStart(3, "0");
        return `${bank}_${program}`;
    };

    export const parsePresetKey = (key: string): PresetKey | null => {
        if (!/^\d{3}_\d{3}$/.test(key)) return null;

        const [bank, program] = key.split("_").map((value) => Number(value));
        return { bank, program };
    };

    export const formatPresetTableRow = (preset: Preset) => {
        return [
            preset.bank.toString().padStart(3, "0"),
            preset.program.toString().padStart(3, "0"),
            preset.name,
        ];
    };
}

export default SoundFontFile;
