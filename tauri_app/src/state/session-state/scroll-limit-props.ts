export type ScrollLimitProps = {
  scrollMiddleX: number;
  scrollMiddleY: number;
  rectWidth: number;
  rectHeight: number;
};

export const getScrollLimitProps = (ref?: HTMLElement) => {
  if (ref == undefined) return null;
  const rect = ref.getBoundingClientRect();

  const props: ScrollLimitProps = {
    scrollMiddleX: ref.scrollLeft + rect.width / 2,
    scrollMiddleY: ref.scrollTop + rect.height / 2,
    rectWidth: rect.width,
    rectHeight: rect.height,
  };

  return props;
};
