const DEFAULT_MAX_SIDE = 800;
const DEFAULT_QUALITY = 0.85;

/**
 * Scales an image down so its longest side is at most `maxSide` and re-encodes it as JPEG.
 * A multi-megabyte phone photo becomes ~100 KB, small enough to upload and store as-is.
 */
export async function resizeImage(file: File, maxSide = DEFAULT_MAX_SIDE, quality = DEFAULT_QUALITY): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported in this browser");

  // JPEG has no transparency; paint white first so transparent PNGs don't turn black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't encode the image"))),
      "image/jpeg",
      quality
    );
  });
}
