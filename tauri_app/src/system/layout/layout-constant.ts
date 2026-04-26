namespace Layout {
  export const root = {
    HEADER_HEIGHT: 40,
    OUTLINE_WIDTH: 210,
  };
  export const timelineHeader = {
    MEMORI_HEIGHT: 40,
    BLOCK_HEIGHT: 40,
    INFO_HEIGHT: 50,
  };
  export const timeline = {
    PITCH_WIDTH: 70,
    HEADER_HEIGHT:
      timelineHeader.MEMORI_HEIGHT +
      timelineHeader.BLOCK_HEIGHT +
      timelineHeader.INFO_HEIGHT,
  };
  export const outline = {
    HEADER_HEIGHT: 102,
    FOOTER_HEIGHT: 0,
  };

  export const pitch = {
    TOP_MARGIN: 60,
    FRAME_WIDTH: 80,
    NUM: 94,
    ITEM_HEIGHT: 30,
  };
  export const getPitchTop = (index: number) => {
    return pitch.ITEM_HEIGHT * (pitch.NUM - 1 - index);
  };

  export const element = {
    INIT_RECORD_HEIGHT: 32,
    INIT_RECORD_MARGIN: 4,
    SECTION_LABEL_HEIGHT: 30,
    SECTION_BORDER_HEIGHT: 8,
    SECTION_TOP_MARGIN: 10,
    SECTION_BOTTOM_MARGIN: 15,
    CHORD_SEQ_HEIGHT: 15,
    CHORD_TIP_HEIGHT: 20,
    CHORD_DEGREE_HEIGHT: 30,
    CHORD_NAME_HEIGHT: 30,
    CHORD_ARR_HEIGHT: 20,
    MODULATE_RECRORD_HEIGHT: 30,
  };

  export const arrange = {
    piano: {
      VOICING_OCTAVE_MAX: 8,
      VOICING_STRUCT_MAX: 8,
      VOICING_ITEM_WIDTH: 70,
      VOICING_ITEM_HEIGHT: 30,
      VOICING_STRUCT_WIDTH: 100,

      BACKING_LEN_HEIGHT: 30,
      BACKING_MEASURE_HEIGHT: 30,
      BACKING_RECORD_HEIGHT: 24,
      BACKING_RECORD_WIDTH: 60,
      BACKING_RECORD_MAX: 12,
      BACKING_COL_MAX: 16,
      BACKING_PEDAL_HEIGHT: 42,

      DIV1_WIDTH: 135,
    },
  };
}

export default Layout;
