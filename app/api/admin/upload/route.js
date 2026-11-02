import { NextResponse } from "next/server";
import cloudinary, { isCloudinaryConfigured, configureCloudinary } from "@/lib/cloudinary";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Allowed MIME types for product image uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Maximum allowed file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * GET /api/admin/upload
 *
 * Diagnostic endpoint for admin panel to check Cloudinary configuration status
 * without exposing sensitive API secrets.
 */
export async function GET(request) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Session expired or invalid" },
      { status: 401 }
    );
  }

  const configured = isCloudinaryConfigured();
  return NextResponse.json(
    {
      success: true,
      configured,
      message: configured
        ? "Cloudinary is configured and ready"
        : "Cloudinary credentials are not configured",
    },
    { status: 200 }
  );
}

/**
 * POST /api/admin/upload
 *
 * Secure server-side image upload to Cloudinary for AK Kiosk admin panel.
 * Protected with administrator session cookie.
 */
export async function POST(request) {
  try {
    // 1. Verify administrator authentication
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Administrator session required." },
        { status: 401 }
      );
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Session expired or invalid" },
        { status: 401 }
      );
    }

    // 2. Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message:
            "Cloudinary credentials are not configured. You can still add products using direct image URLs or configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local.",
        },
        { status: 503 }
      );
    }

    // Ensure Cloudinary instance is configured with latest credentials
    const configuredCloudinary = configureCloudinary();

    // 3. Parse multipart form data
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // 4. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type (${file.type}). Allowed types: JPEG, PNG, WEBP, GIF.`,
        },
        { status: 400 }
      );
    }

    // 5. Validate file size (<= 5MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    // 6. Convert file into Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = configuredCloudinary.uploader.upload_stream(
        {
          folder: "ak-kiosk/products",
          resource_type: "image",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: uploadResult.secure_url || uploadResult.url,
          public_id: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] Upload error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to upload image to Cloudinary",
      },
      { status: 500 }
    );
  }
}
