export type TrackInstRef =
  | {
    source: "builtin";
    name: string;
  }
  | {
    source: "soundfont";
    definitionName: string;
    bank: number;
    program: number;
  };
