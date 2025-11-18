import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const phone = body?.phone
    if (!phone) {
      return NextResponse.json({ error: "Phone is required in body { phone: \"+91...\" }" }, { status: 400 })
    }

    const payload: any = { id: user.id, phone_number: phone }
    if (user.email) payload.email = user.email

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
