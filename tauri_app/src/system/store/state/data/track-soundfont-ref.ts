export type TrackSoundFontRef =
  | {
    source: "builtin";
    name: string;
  }
  | {
    source: "user";
    definitionName: string;
    bank: number;
    program: number;
  };
