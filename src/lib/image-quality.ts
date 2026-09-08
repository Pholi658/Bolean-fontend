export interface QualityCheckResult {
  passed: boolean;
  message?: string;
}

/**
 * Lightweight, client-side approximation of the backend's AWS Rekognition
 * quality gate (brightness/sharpness thresholds) — it does NOT replace that
 * check, it just stops an obviously bad photo (too dark, too blurry) from
 * ever leaving the browser and wasting a Rekognition call.
 */
export function checkImageQuality(canvas: HTMLCanvasElement): QualityCheckResult {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { passed: true };

  // Downsample for a fast pass over the pixels.
  const sampleSize = 96;
  const sample = document.createElement("canvas");
  sample.width = sampleSize;
  sample.height = sampleSize;
  const sampleCtx = sample.getContext("2d");
  if (!sampleCtx) return { passed: true };
  sampleCtx.drawImage(canvas, 0, 0, sampleSize, sampleSize);

  const { data } = sampleCtx.getImageData(0, 0, sampleSize, sampleSize);
  const gray = new Float32Array(sampleSize * sampleSize);
  let brightnessSum = 0;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    gray[p] = luminance;
    brightnessSum += luminance;
  }

  const brightness = (brightnessSum / gray.length / 255) * 100; // 0-100 scale

  // Simple gradient-magnitude variance as a sharpness proxy (blurry images
  // have low-variance gradients; sharp edges produce high-variance ones).
  let gradientSum = 0;
  let gradientSumSq = 0;
  let count = 0;
  for (let y = 1; y < sampleSize - 1; y++) {
    for (let x = 1; x < sampleSize - 1; x++) {
      const idx = y * sampleSize + x;
      const gx = (gray[idx + 1] ?? 0) - (gray[idx - 1] ?? 0);
      const gy = (gray[idx + sampleSize] ?? 0) - (gray[idx - sampleSize] ?? 0);
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      gradientSum += magnitude;
      gradientSumSq += magnitude * magnitude;
      count++;
    }
  }
  const meanGradient = gradientSum / count;
  const sharpness = Math.sqrt(Math.max(0, gradientSumSq / count - meanGradient * meanGradient));

  if (brightness < 22 || sharpness < 3.5) {
    return { passed: false, message: "Image too dark or blurry. Please retake in better lighting." };
  }
  return { passed: true };
}

export function captureFrameToCanvas(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      quality,
    );
  });
}
