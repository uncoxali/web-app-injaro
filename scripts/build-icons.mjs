import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { svgPathBbox } from "svg-path-bbox";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "../src/assets/icons");
const outFile = path.join(__dirname, "../src/components/ui/icons-registry.ts");

const TARGET = 24;
const PADDING_RATIO = 0.12;

/** Icons with decorative overflow outside the main glyph */
const BBOX_OVERRIDES = {
  // eye.svg has side lines + rays that inflate auto bbox
  eye: { minX: 34, minY: 29, maxX: 238, maxY: 127 },
};

/** Extra scale for icons that still look small after bbox crop */
const SCALE_OVERRIDES = {
  eye: 1.55,
};

function expandBounds(minX, minY, maxX, maxY, x0, y0, x1, y1) {
  return [
    Math.min(minX, x0, x1),
    Math.min(minY, y0, y1),
    Math.max(maxX, x0, x1),
    Math.max(maxY, y0, y1),
  ];
}

function includePoint(minX, minY, maxX, maxY, x, y) {
  return [
    Math.min(minX, x),
    Math.min(minY, y),
    Math.max(maxX, x),
    Math.max(maxY, y),
  ];
}

function parseAttr(tag, name) {
  const re = new RegExp(`${name}=["']([^"']+)["']`, "i");
  return tag.match(re)?.[1];
}

function getContentBbox(svg) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxStroke = 0;

  for (const m of svg.matchAll(/<path\b[^>]*>/gi)) {
    const tag = m[0];
    const d = parseAttr(tag, "d");
    if (!d) continue;

    const strokeWidth = parseFloat(
      parseAttr(tag, "stroke-width") ?? parseAttr(tag, "strokeWidth") ?? "0"
    );
    maxStroke = Math.max(maxStroke, strokeWidth);

    try {
      const [x0, y0, x1, y1] = svgPathBbox(d);
      [minX, minY, maxX, maxY] = expandBounds(minX, minY, maxX, maxY, x0, y0, x1, y1);
    } catch {
      // ignore invalid paths
    }
  }

  for (const m of svg.matchAll(/<line\b[^>]*>/gi)) {
    const tag = m[0];
    const x1 = parseFloat(parseAttr(tag, "x1") ?? "0");
    const y1 = parseFloat(parseAttr(tag, "y1") ?? "0");
    const x2 = parseFloat(parseAttr(tag, "x2") ?? "0");
    const y2 = parseFloat(parseAttr(tag, "y2") ?? "0");
    [minX, minY, maxX, maxY] = expandBounds(minX, minY, maxX, maxY, x1, y1, x2, y2);
  }

  for (const m of svg.matchAll(/<polyline\b[^>]*>/gi)) {
    const points = parseAttr(m[0], "points");
    if (!points) continue;
    const nums = points.trim().split(/[\s,]+/).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      [minX, minY, maxX, maxY] = includePoint(minX, minY, maxX, maxY, nums[i], nums[i + 1]);
    }
  }

  for (const m of svg.matchAll(/<circle\b[^>]*>/gi)) {
    const tag = m[0];
    const cx = parseFloat(parseAttr(tag, "cx") ?? "0");
    const cy = parseFloat(parseAttr(tag, "cy") ?? "0");
    const r = parseFloat(parseAttr(tag, "r") ?? "0");
    [minX, minY, maxX, maxY] = expandBounds(minX, minY, maxX, maxY, cx - r, cy - r, cx + r, cy + r);
  }

  for (const m of svg.matchAll(/<rect\b[^>]*>/gi)) {
    const tag = m[0];
    const x = parseFloat(parseAttr(tag, "x") ?? "0");
    const y = parseFloat(parseAttr(tag, "y") ?? "0");
    const w = parseFloat(parseAttr(tag, "width") ?? "0");
    const h = parseFloat(parseAttr(tag, "height") ?? "0");
    [minX, minY, maxX, maxY] = expandBounds(minX, minY, maxX, maxY, x, y, x + w, y + h);
  }

  if (!isFinite(minX)) {
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1]?.split(/\s+/).map(Number);
    if (viewBox?.length === 4) {
      return {
        minX: viewBox[0],
        minY: viewBox[1],
        maxX: viewBox[0] + viewBox[2],
        maxY: viewBox[1] + viewBox[3],
      };
    }
    return null;
  }

  const strokePad = maxStroke / 2;
  return {
    minX: minX - strokePad,
    minY: minY - strokePad,
    maxX: maxX + strokePad,
    maxY: maxY + strokePad,
  };
}

function normalizeColors(content) {
  return content
    .replace(/fill="#[0-9a-fA-F]{3,8}"/g, 'fill="currentColor"')
    .replace(/stroke="#[0-9a-fA-F]{3,8}"/g, 'stroke="currentColor"')
    .replace(/fill="white"/gi, 'fill="currentColor"')
    .replace(/stroke="white"/gi, 'stroke="currentColor"')
    .replace(/stroke-width="/gi, 'strokeWidth="')
    .replace(/stroke-linecap="/gi, 'strokeLinecap="')
    .replace(/stroke-linejoin="/gi, 'strokeLinejoin="')
    .replace(/stroke-miterlimit="/gi, 'strokeMiterlimit="')
    .replace(/fill-rule="/gi, 'fillRule="')
    .replace(/clip-rule="/gi, 'clipRule="');
}

function extractInnerSvg(svg) {
  return svg
    .replace(/<\?xml[^?]*\?>\s*/i, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();
}

function fitToStandardViewBox(svg, iconKey) {
  const coloredInner = normalizeColors(extractInnerSvg(svg));
  const bbox = BBOX_OVERRIDES[iconKey] ?? getContentBbox(svg);
  if (!bbox) {
    return `<svg viewBox="0 0 ${TARGET} ${TARGET}" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">${coloredInner}</svg>`;
  }

  const contentW = bbox.maxX - bbox.minX;
  const contentH = bbox.maxY - bbox.minY;
  if (contentW <= 0 || contentH <= 0) {
    return `<svg viewBox="0 0 ${TARGET} ${TARGET}" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">${coloredInner}</svg>`;
  }

  const innerSize = TARGET * (1 - PADDING_RATIO * 2);
  const scale =
    Math.min(innerSize / contentW, innerSize / contentH) *
    (SCALE_OVERRIDES[iconKey] ?? 1);
  const tx = (TARGET - contentW * scale) / 2 - bbox.minX * scale;
  const ty = (TARGET - contentH * scale) / 2 - bbox.minY * scale;

  return `<svg viewBox="0 0 ${TARGET} ${TARGET}" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="translate(${tx} ${ty}) scale(${scale})">${coloredInner}</g></svg>`;
}

const files = fs
  .readdirSync(iconsDir)
  .filter((f) => f.endsWith(".svg"))
  .sort();

const entries = files.map((file) => {
  const key = file.replace(/\.svg$/, "");
  const raw = fs.readFileSync(path.join(iconsDir, file), "utf8");
  const normalized = fitToStandardViewBox(raw, key);
  return `  "${key}": ${JSON.stringify(normalized)},`;
});

const output = `/* eslint-disable */
// Auto-generated by scripts/build-icons.mjs — do not edit manually
export const iconsRegistry = {
${entries.join("\n")}
} as const;

export type IconName = keyof typeof iconsRegistry;
`;

fs.writeFileSync(outFile, output);
console.log(`Generated ${files.length} normalized icons -> ${outFile}`);
