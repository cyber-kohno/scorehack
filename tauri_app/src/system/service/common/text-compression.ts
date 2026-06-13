import pako from "pako";

namespace TextCompression {
    const uint8ArrayToBase64 = (buffer: Uint8Array) => {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    export const zip = (baseStr: string) => {
        const encoder = new TextEncoder();
        const textUint8Array = encoder.encode(baseStr);
        const compressed = pako.gzip(textUint8Array);
        return uint8ArrayToBase64(compressed);
    };

    export const unzip = (baseStr: string) => {
        const compressedFromBase64 = Uint8Array.from(atob(baseStr), c => c.charCodeAt(0));
        return pako.inflate(compressedFromBase64, { to: "string" });
    };
}

export default TextCompression;
