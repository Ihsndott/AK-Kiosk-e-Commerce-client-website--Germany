import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { requireAdmin } from "@/lib/adminAuth";

// Utility to escape CSV cells against formula injection
function escapeCsv(value) {
  if (typeof value !== "string") return value;
  // Prepend a single quote if the cell starts with =,+,-,@
  if (/^[=+\-@]/.test(value)) return "'" + value;
  return value;
}

export const dynamic = "force-dynamic";


/**
 * GET /api/admin/subscribers
 *
 * Protected — returns paginated subscriber list with optional search.
 * Pass ?format=csv to download as a CSV file.
 */
export async function GET(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const format = searchParams.get("format");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query = { isActive: true };

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.email = { $regex: safe, $options: "i" };
    }

    function escapeCsv(value) {
  if (typeof value !== "string") return value;
  // Prepend a single quote if the cell starts with =,+,-,@
  if (/^[=+\-@]/.test(value)) return "'" + value;
  return value;
}

    if (format === "csv") {
      const subscribers = await Subscriber.find(query)
        .sort({ createdAt: -1 })
        .limit(10000)
        .select("email createdAt source -_id")
        .lean();

      const header = "Email,Subscribed Date,Source\r\n";
      const rows = subscribers
        .map((s) => {
          const date = s.createdAt
            ? new Date(s.createdAt).toISOString().slice(0, 10)
            : "";
          return `"${s.email}","${date}","${s.source || "footer"}"`;
        })
        .join("\r\n");

      const csv = header + rows;

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="ak-kiosk-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const [subscribers, total] = await Promise.all([
      Subscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Subscriber.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: subscribers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] GET /api/admin/subscribers error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve subscribers." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subscribers?id=<subscriberId>
 *
 * Protected — permanently removes a subscriber.
 */
export async function DELETE(request) {
  try {
    const payload = await requireAdmin(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Subscriber ID is required." },
        { status: 422 }
      );
    }

    await connectToDatabase();

    const subscriber = await Subscriber.findByIdAndDelete(id);

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscriber removed." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AK Kiosk API] DELETE /api/admin/subscribers error:", error?.message);
    return NextResponse.json(
      { success: false, message: "Failed to remove subscriber." },
      { status: 500 }
    );
  }
}

