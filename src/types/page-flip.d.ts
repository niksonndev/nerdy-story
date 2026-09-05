declare module "page-flip" {
  export type PageState =
    | "user_fold"
    | "fold_corner"
    | "flipping"
    | "read";

  export type FlipCorner = "top" | "bottom";

  export interface FlipSetting {
    startPage: number;
    size: "fixed" | "stretch";
    width: number;
    height: number;
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    drawShadow: boolean;
    flippingTime: number;
    usePortrait: boolean;
    startZIndex: number;
    autoSize: boolean;
    maxShadowOpacity: number;
    showCover: boolean;
    mobileScrollSupport: boolean;
    clickEventForward: boolean;
    useMouseEvents: boolean;
    swipeDistance: number;
    showPageCorners: boolean;
    disableFlipByClick: boolean;
  }

  export interface PageFlipUI {
    getDistElement(): HTMLElement;
  }

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>);
    destroy(): void;
    update(): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    flipPrev(corner?: FlipCorner): void;
    flipNext(corner?: FlipCorner): void;
    getUI(): PageFlipUI;
    getState(): PageState;
  }
}
