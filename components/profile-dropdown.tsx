"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Phone, Mail, LogOut, Pencil, Check, Loader2, AlertCircle, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface ProfileDropdownProps {
  initialName?: string | null
  initialEmail?: string | null
}

export function ProfileDropdown({ initialName, initialEmail }: ProfileDropdownProps) {
  const [name, setName] = useState(initialName || "")
  const [email, setEmail] = useState(initialEmail || "")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingPhone, setEditingPhone] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [phoneInput, setPhoneInput] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        if (user.email) setEmail(user.email)

        const { data: profile } = await supabase
          .from("profiles")
          .select("phone_number, full_name")
          .eq("id", user.id)
          .single()

        if (profile?.phone_number) setPhoneNumber(profile.phone_number)
        if (profile?.full_name) setName(profile.full_name)
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const saveField = async (field: "phone_number" | "full_name", value: string) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError("Not authenticated"); return }

      const payload: any = { id: user.id, [field]: value }
      if (user.email) payload.email = user.email

      const { error: err } = await supabase
        .from("profiles")
        .upsert(payload)
        .select()
        .single()

      if (err) {
        setError(err.message)
      } else {
        if (field === "phone_number") {
          setPhoneNumber(value)
          setEditingPhone(false)
        } else {
          setName(value)
          setEditingName(false)
        }
        setSuccess("Saved")
        setTimeout(() => setSuccess(null), 2000)
      }
    } catch (e: any) {
      setError(e.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const initials = name
    ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : email ? email[0].toUpperCase() : "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors outline-none">
          <div className="w-7 h-7 rounded-full bg-[oklch(0.55_0.25_280)]/20 border border-[oklch(0.55_0.25_280)]/25 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-[oklch(0.75_0.18_280)]">{initials}</span>
          </div>
          <span className="text-sm text-white/50 hidden sm:block max-w-[120px] truncate">{name || "Profile"}</span>
          <ChevronDown className="w-3 h-3 text-white/25" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 bg-[oklch(0.13_0.008_270)] border-white/[0.08] text-white p-0 rounded-xl overflow-hidden"
      >
        {/* Profile header */}
        <div className="px-4 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[oklch(0.55_0.25_280)]/15 border border-[oklch(0.55_0.25_280)]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[oklch(0.75_0.18_280)]">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{name || "User"}</p>
              <p className="text-xs text-white/30 truncate">{email}</p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-white/[0.06] m-0" />

        {/* Profile fields */}
        <div className="p-3 space-y-3">
          {/* Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-white/35">
                <User className="w-3 h-3" />
                <span className="text-[11px] font-medium">Name</span>
              </div>
              {!editingName && (
                <button
                  onClick={() => { setNameInput(name); setEditingName(true); setError(null) }}
                  className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            {editingName ? (
              <div className="flex gap-1.5">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveField("full_name", nameInput) }}
                  className="h-8 bg-white/[0.04] border-white/[0.08] text-white text-sm rounded-lg focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => saveField("full_name", nameInput)}
                  disabled={saving}
                  className="h-8 px-2.5 bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] border-0 rounded-lg"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setEditingName(false); setError(null) }}
                  className="h-8 px-2 text-white/30 hover:text-white hover:bg-white/[0.04] rounded-lg"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <p className="text-sm text-white/70 pl-0.5">{name || "Not set"}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center gap-1.5 text-white/35 mb-1.5">
              <Mail className="w-3 h-3" />
              <span className="text-[11px] font-medium">Email</span>
            </div>
            <p className="text-sm text-white/70 pl-0.5">{email}</p>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-white/35">
                <Phone className="w-3 h-3" />
                <span className="text-[11px] font-medium">Phone</span>
              </div>
              {!editingPhone && (
                <button
                  onClick={() => { setPhoneInput(phoneNumber); setEditingPhone(true); setError(null) }}
                  className="text-[11px] text-white/25 hover:text-white/50 transition-colors"
                >
                  {phoneNumber ? "Edit" : "Add"}
                </button>
              )}
            </div>
            {editingPhone ? (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <Input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => { setPhoneInput(e.target.value); setError(null) }}
                    onKeyDown={(e) => { if (e.key === "Enter") saveField("phone_number", phoneInput) }}
                    placeholder="+1 555-123-4567"
                    className="h-8 bg-white/[0.04] border-white/[0.08] text-white text-sm rounded-lg placeholder:text-white/15 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => saveField("phone_number", phoneInput)}
                    disabled={saving}
                    className="h-8 px-2.5 bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] border-0 rounded-lg"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingPhone(false); setError(null) }}
                    className="h-8 px-2 text-white/30 hover:text-white hover:bg-white/[0.04] rounded-lg"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-[10px] text-white/20 pl-0.5">Include country code (e.g. +91, +1)</p>
              </div>
            ) : (
              <p className="text-sm text-white/70 pl-0.5">
                {phoneNumber || <span className="text-white/25 italic">Not set</span>}
              </p>
            )}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[11px]">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-green-500/[0.08] border border-green-500/20 text-green-400 text-[11px]">
              <Check className="w-3 h-3 flex-shrink-0" />
              {success}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-white/[0.06] m-0" />

        {/* Sign out */}
        <div className="p-2">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/40 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
