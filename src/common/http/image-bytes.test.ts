import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedImageBuffer, isAllowedImageMime, isBlockedImageName } from "./image-bytes";

test("image-bytes: accepts jpeg/png/gif/webp signatures", () => {
  assert.equal(isAllowedImageBuffer(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0])), true);
  assert.equal(
    isAllowedImageBuffer(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])),
    true
  );
  assert.equal(isAllowedImageBuffer(Buffer.from("GIF89a......")), true);

  const webp = Buffer.alloc(12);
  Buffer.from("RIFF").copy(webp, 0);
  Buffer.from("WEBP").copy(webp, 8);
  assert.equal(isAllowedImageBuffer(webp), true);
});

test("image-bytes: rejects svg/html and short buffers", () => {
  assert.equal(isAllowedImageBuffer(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>")), false);
  assert.equal(isAllowedImageBuffer(Buffer.from("<!DOCTYPE html><html></html>")), false);
  assert.equal(isAllowedImageBuffer(Buffer.from([0xff, 0xd8])), false);
});

test("image-bytes: mime and extension guards", () => {
  assert.equal(isAllowedImageMime("image/jpeg"), true);
  assert.equal(isAllowedImageMime("image/svg+xml"), false);
  assert.equal(isBlockedImageName("logo.SVG"), true);
  assert.equal(isBlockedImageName("photo.jpg"), false);
});
