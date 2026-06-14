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

interface OwnerRow extends RowDataPacket {
  agency_user_id: number
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }
  try {
    const [rows] = await db.query<PackageRow[]>(
      "SELECT * FROM packages WHERE id = ? LIMIT 1",
      [id]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(rowToPackage(rows[0]))
  } catch (err) {
    console.error("GET /api/packages/[id] error:", err)
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id: rawId } = await params
  const id = Number(rawId)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const [ownerRows] = await db.query<OwnerRow[]>(
    "SELECT agency_user_id FROM packages WHERE id = ? LIMIT 1",
    [id]
  )
  if (ownerRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (ownerRows[0].agency_user_id !== auth.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const {
    title, destination, country, price, duration, image, description,
    includedServices, excludedServices, tags, status, contactEmail, contactPhone,
  } = body as Record<string, unknown>

  try {
    await db.query<ResultSetHeader>(
      `UPDATE packages SET
         title = ?, destination = ?, country = ?,
         price = ?, duration = ?, image = ?, description = ?,
         included_services = ?, excluded_services = ?,
         tags = ?, status = ?, contact_email = ?, contact_phone = ?
       WHERE id = ?`,
      [
        title,
        destination,
        country           ?? null,
        parseFloat(String(price)) || 0,
        duration          ?? null,
        image             ?? null,
        description       ?? null,
        includedServices  ?? null,
        excludedServices  ?? null,
        tags ? JSON.stringify(tags) : null,
        status            ?? "active",
        contactEmail      ?? null,
        contactPhone      ?? null,
        id,
      ]
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PATCH /api/packages/[id] error:", err)
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id: rawId } = await params
  const id = Number(rawId)
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const [ownerRows] = await db.query<OwnerRow[]>(
    "SELECT agency_user_id FROM packages WHERE id = ? LIMIT 1",
    [id]
  )
  if (ownerRows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (ownerRows[0].agency_user_id !== auth.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    await db.query("DELETE FROM packages WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/packages/[id] error:", err)
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
  }
}
