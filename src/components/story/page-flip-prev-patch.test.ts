import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import { PageFlip } from "page-flip";

const require = createRequire(import.meta.url);

describe("page-flip flipPrev patch", () => {
  let flip: InstanceType<typeof PageFlip> | undefined;

  afterEach(() => {
    flip?.destroy();
    flip = undefined;
    document.body.replaceChildren();
  });

  it("aims the synthetic click at the book left edge", () => {
    const source = readFileSync(require.resolve("page-flip"), "utf8");
    expect(source).toContain(
      'flipPrev(t){this.flip({x:this.render.getRect().left+10,y:"top"===t?1:this.render.getRect().height-2})}',
    );
  });

  it("peels the current portrait sheet instead of flying the previous page in", () => {
    const source = readFileSync(require.resolve("page-flip"), "utf8");
    expect(source).toContain(
      'if("portrait"===this.render.getOrientation())return this.pages[e].newTemporaryCopy();',
    );
    expect(source).toContain(
      'convertToGlobal(t,e){if(e||(e=this.direction),null==t)return null;const i=this.getRect();return{x:0===e?t.x+i.left+i.width/2:("portrait"===this.orientation?i.left+i.width:i.left+i.width/2)-t.x,y:t.y+i.top}}',
    );
  });

  it("starts a back curl when disableFlipByClick is on", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const pages = ["one", "two"].map((text) => {
      const el = document.createElement("div");
      el.textContent = text;
      return el;
    });

    flip = new PageFlip(root, {
      width: 400,
      height: 600,
      size: "stretch",
      minWidth: 400,
      maxWidth: 400,
      minHeight: 600,
      maxHeight: 600,
      usePortrait: true,
      autoSize: false,
      disableFlipByClick: true,
      useMouseEvents: false,
      showPageCorners: false,
      startPage: 1,
      flippingTime: 50,
      drawShadow: false,
    });
    flip.loadFromHTML(pages);

    const dist = flip.getUI().getDistElement();
    Object.defineProperty(dist, "offsetWidth", {
      configurable: true,
      get: () => 400,
    });
    Object.defineProperty(dist, "offsetHeight", {
      configurable: true,
      get: () => 600,
    });
    flip.update();
    await new Promise((resolve) => setTimeout(resolve, 20));

    flip.flipPrev("bottom");
    expect(flip.getState()).toBe("flipping");
    const texts = [...dist.querySelectorAll(".stf__item")].map(
      (el) => el.textContent,
    );
    expect(texts.filter((text) => text === "two")).toHaveLength(2);
    expect(texts).toContain("one");
  });
});
