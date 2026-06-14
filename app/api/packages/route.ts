import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface PackageRow extends RowDataPacket {
  id:                number
  agency_user_id:    number
  agency_name:       string | null
  title:             string
  destination:       string
  country:           string | null
  price:             string
  duration:          string | null
  image:             string | null
  description:       string | null
  included_services: string | null
  excluded_services: string | null
  tags:              string | null
  status:            string
  contact_email:     string | null
  contact_phone:     string | null
  created_at:        string
}

function rowToPackage(row: PackageRow) {
  return {
    id:               String(row.id),
    agencyId:         String(row.agency_user_id),
    agencyName:       row.agency_name       ?? "",
    title:            row.title,
    destination:      row.destination,
    country:          row.country           ?? undefined,
    price:            parseFloat(row.price),
    duration:         row.duration          ?? "",
    image:            row.image             ?? "",
    description:      row.description       ?? "",
    includedServices: row.included_services ?? undefined,
    excludedServices: row.excluded_services ?? undefined,
    tags:             row.tags ? (JSON.parse(row.tags) as string[]) : [],
    status:           (row.status as "draft" | "active" | "featured") ?? "active",
    contactEmail:     row.contact_email     ?? undefined,
    contactPhone:     row.contact_phone     ?? undefined,
    createdAt:        row.created_at,
  }
}

export async function GET() {
  try {
    const [rows] = await db.query<PackageRow[]>(
      "SELECT * FROM packages ORDER BY created_at DESC"
    )
    return NextResponse.json(rows.map(rowToPackage))
  } catch (err) {
    console.error("GET /api/packages error:", err)
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== "agency") {
    return NextResponse.json({ error: "Agency access required" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const {
    title, destination, country, price, duration, image, description,
    includedServices, excludedServices, tags, status, agencyName,
    contactEmail, contactPhone,
  } = body as Record<string, unknown>

  if (!title || !destination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO packages
         (agency_user_id, agency_name, title, destination, country,
          price, duration, image, description,
          included_services, excluded_services, tags, status,
          contact_email, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auth.user.userId,
        agencyName    ?? null,
        title,
        destination,
        country       ?? null,
        parseFloat(String(price)) || 0,
        duration      ?? null,
        image         ?? null,
        description   ?? null,
        includedServices ?? null,
        excludedServices ?? null,
        tags ? JSON.stringify(tags) : null,
        status        ?? "active",
        contactEmail  ?? null,
        contactPhone  ?? null,
      ]
    )
    return NextResponse.json({ id: String(result.insertId) }, { status: 201 })
  } catch (err) {
    console.error("POST /api/packages error:", err)
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
  }
}
