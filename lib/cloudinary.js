import { v2 as cloudinary } from "cloudinary";

/**
 * Sanitizes an environment variable value by trimming whitespace
 * and stripping redundant surrounding double or single quotes.
 */
function cleanEnv(val) {
  if (!val || typeof val !== "string") return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

/**
 * Dynamically configures Cloudinary with current environment variables.
 * Safe to invoke at runtime to ensure latest credentials are applied.
 */
export function configureCloudinary() {
  const cloud_name = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const api_key = cleanEnv(process.env.CLOUDINARY_API_KEY);
  const api_secret = cleanEnv(process.env.CLOUDINARY_API_SECRET);

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Checks whether Cloudinary credentials have been defined in environment variables.
 * Returns true if all three required variables are present and non-empty.
 */
export const isCloudinaryConfigured = () => {
  const cloudName = cleanEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = cleanEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = cleanEnv(process.env.CLOUDINARY_API_SECRET);

  return Boolean(
    cloudName &&
      apiKey &&
      apiSecret &&
      !cloudName.startsWith("your_") &&
      !apiKey.startsWith("your_") &&
      !apiSecret.startsWith("your_")
  );
};

// Initial bootstrap configuration
configureCloudinary();

export default cloudinary;
