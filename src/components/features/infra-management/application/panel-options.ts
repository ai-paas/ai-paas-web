/** Select 는 label, value 키로 옵션을 읽는다. */
export type PanelOption = { label: string; value: string };

/**
 * 고른 값이 목록에 없으면 한 줄을 끼워 넣는다.
 *
 * <p>목록을 아직 못 받았거나 값이 목록 밖이면 Select 가 "(삭제된 옵션)" 으로 그린다. 멀쩡한
 * 클러스터가 지워진 것처럼 보였다.
 */
export const withSelected = (options: PanelOption[], selected: string): PanelOption[] =>
  !selected || options.some((option) => option.value === selected)
    ? options
    : [{ label: selected, value: selected }, ...options];
