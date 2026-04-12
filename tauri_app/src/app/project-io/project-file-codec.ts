import pako from "pako";

export const uint8ArrayToBase64 = (buffer: Uint8Array) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const gzipToBase64 = (baseStr: string) => {
  const encoder = new TextEncoder();
  const textUint8Array = encoder.encode(baseStr);
  const compressed = pako.gzip(textUint8Array);
  return uint8ArrayToBase64(compressed);
};

export const unzipFromBase64 = (baseStr: string) => {
  const compressedFromBase64 = Uint8Array.from(atob(baseStr), (c) =>
    c.charCodeAt(0),
  );
  return pako.inflate(compressedFromBase64, { to: "string" });
};

export const base64ToBlob = (base64: string, type: string) => {
  const byteString = atob(base64);
  const arrayBuffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    arrayBuffer[i] = byteString.charCodeAt(i);
  }
  return new Blob([arrayBuffer], { type });
};

export const getFileName = (path: string) => {
  const normalized = path.replaceAll("\\", "/");
  const segments = normalized.split("/");
  return segments[segments.length - 1] || path;
};
