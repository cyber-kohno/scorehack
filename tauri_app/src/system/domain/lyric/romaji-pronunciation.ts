namespace RomajiPronunciation {
    const ROMAJI_TO_HIRAGANA = new Map<string, string>([
        ["a", "あ"], ["i", "い"], ["u", "う"], ["e", "え"], ["o", "お"],
        ["ka", "か"], ["ki", "き"], ["ku", "く"], ["ke", "け"], ["ko", "こ"],
        ["sa", "さ"], ["si", "し"], ["shi", "し"], ["su", "す"], ["se", "せ"], ["so", "そ"],
        ["ta", "た"], ["ti", "ち"], ["chi", "ち"], ["tu", "つ"], ["tsu", "つ"], ["te", "て"], ["to", "と"],
        ["na", "な"], ["ni", "に"], ["nu", "ぬ"], ["ne", "ね"], ["no", "の"],
        ["ha", "は"], ["hi", "ひ"], ["hu", "ふ"], ["fu", "ふ"], ["he", "へ"], ["ho", "ほ"],
        ["ma", "ま"], ["mi", "み"], ["mu", "む"], ["me", "め"], ["mo", "も"],
        ["ya", "や"], ["yu", "ゆ"], ["yo", "よ"],
        ["ra", "ら"], ["ri", "り"], ["ru", "る"], ["re", "れ"], ["ro", "ろ"],
        ["wa", "わ"], ["wo", "を"], ["n", "ん"], ["nn", "ん"],
        ["ga", "が"], ["gi", "ぎ"], ["gu", "ぐ"], ["ge", "げ"], ["go", "ご"],
        ["za", "ざ"], ["zi", "じ"], ["ji", "じ"], ["zu", "ず"], ["ze", "ぜ"], ["zo", "ぞ"],
        ["da", "だ"], ["di", "ぢ"], ["du", "づ"], ["de", "で"], ["do", "ど"],
        ["ba", "ば"], ["bi", "び"], ["bu", "ぶ"], ["be", "べ"], ["bo", "ぼ"],
        ["pa", "ぱ"], ["pi", "ぴ"], ["pu", "ぷ"], ["pe", "ぺ"], ["po", "ぽ"],
        ["kya", "きゃ"], ["kyu", "きゅ"], ["kyo", "きょ"],
        ["sha", "しゃ"], ["sya", "しゃ"], ["shu", "しゅ"], ["syu", "しゅ"], ["sho", "しょ"], ["syo", "しょ"],
        ["cha", "ちゃ"], ["tya", "ちゃ"], ["chu", "ちゅ"], ["tyu", "ちゅ"], ["cho", "ちょ"], ["tyo", "ちょ"],
        ["nya", "にゃ"], ["nyu", "にゅ"], ["nyo", "にょ"],
        ["hya", "ひゃ"], ["hyu", "ひゅ"], ["hyo", "ひょ"],
        ["mya", "みゃ"], ["myu", "みゅ"], ["myo", "みょ"],
        ["rya", "りゃ"], ["ryu", "りゅ"], ["ryo", "りょ"],
        ["gya", "ぎゃ"], ["gyu", "ぎゅ"], ["gyo", "ぎょ"],
        ["ja", "じゃ"], ["zya", "じゃ"], ["ju", "じゅ"], ["zyu", "じゅ"], ["jo", "じょ"], ["zyo", "じょ"],
        ["bya", "びゃ"], ["byu", "びゅ"], ["byo", "びょ"],
        ["pya", "ぴゃ"], ["pyu", "ぴゅ"], ["pyo", "ぴょ"],
        ["xtu", "っ"], ["ltu", "っ"], ["xtsu", "っ"], ["ltsu", "っ"],
    ]);

    const SMALL_HIRAGANA = new Set(["ゃ", "ゅ", "ょ", "ぁ", "ぃ", "ぅ", "ぇ", "ぉ"]);

    const toHiraganaChar = (char: string) => {
        const code = char.charCodeAt(0);
        if (code >= 0x30a1 && code <= 0x30f6) return String.fromCharCode(code - 0x60);
        return char;
    };

    const normalizeKana = (value: string) => {
        return Array.from(value).map(toHiraganaChar).join("");
    };

    const isSingleHiraganaMora = (value: string) => {
        const chars = Array.from(normalizeKana(value));
        if (chars.length === 1) {
            const code = chars[0].charCodeAt(0);
            return code >= 0x3041 && code <= 0x3096;
        }
        if (chars.length !== 2 || !SMALL_HIRAGANA.has(chars[1])) return false;

        const firstCode = chars[0].charCodeAt(0);
        return firstCode >= 0x3041 && firstCode <= 0x3096;
    };

    export const toHiragana = (pron: string): string | null => {
        const value = pron.trim().toLowerCase();
        if (value.length === 0) return null;

        const converted = ROMAJI_TO_HIRAGANA.get(value);
        if (converted != undefined) return converted;

        const kana = normalizeKana(value);
        return isSingleHiraganaMora(kana) ? kana : null;
    };
}

export default RomajiPronunciation;
