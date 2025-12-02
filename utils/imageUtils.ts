import { removeBackground } from "@imgly/background-removal";

/**
 * Removes the background from a given image blob/file.
 * Uses @imgly/background-removal which runs client-side via WebAssembly.
 */
export const processImageBackground = async (imageFile: File): Promise<string> => {
  try {
    // Config to force local processing if possible, or fetch assets efficiently
    const config = {
      progress: (key: string, current: number, total: number) => {
        console.log(`Downloading ${key}: ${current} of ${total}`);
      },
      debug: false
    };

    const blob = await removeBackground(imageFile, config);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error("Failed to remove background. Please try another image.");
  }
};