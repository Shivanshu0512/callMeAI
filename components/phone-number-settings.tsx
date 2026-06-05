"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, Check, AlertCircle, Loader2, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function PhoneNumberSettings() {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("phone_number")
            .eq("id", user.id)
            .single()

          if (profile?.phone_number) {
            setPhoneNumber(profile.phone_number)
          }
        }
      } catch (err) {
        console.error("Error fetching phone number:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhoneNumber()
  }, [])

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      setError("Phone number cannot be empty")
      return
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phoneNumber) || phoneNumber.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number with country code")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("User not authenticated")
        setIsSaving(false)
        return
      }

      const upsertPayload: any = { id: user.id, phone_number: phoneNumber }
      if (user.email) upsertPayload.email = user.email

      const { data: upserted, error: upsertError } = await supabase
        .from("profiles")
        .upsert(upsertPayload)
        .select()
        .single()

      if (upsertError) {
        setError(upsertError.message)
      } else if (upserted) {
        setPhoneNumber(upserted.phone_number || phoneNumber)
        setSuccess(true)
        setIsEditing(false)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError("Failed to save phone number")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save phone number")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
          <span className="text-sm text-white/30">Loading phone settings...</span>
        </div>
      </div>
    )
  }

  const hasPhoneNumber = phoneNumber.trim().length > 0

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-[oklch(0.55_0.25_280)]/10 flex items-center justify-center">
          <Phone className="w-4 h-4 text-[oklch(0.75_0.18_280)]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Phone Number</h3>
          <p className="text-xs text-white/30">
            {hasPhoneNumber ? "Calls will be made to this number" : "Required to receive accountability calls"}
          </p>
        </div>
        {hasPhoneNumber && !isEditing && (
          <div className="flex items-center gap-1.5 text-xs text-green-400/70">
            <Check className="w-3.5 h-3.5" />
            <span>Saved</span>
          </div>
        )}
      </div>

      {/* View mode */}
      {!isEditing && hasPhoneNumber && (
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-sm font-medium text-white/80">{phoneNumber}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-white/30 hover:text-white hover:bg-white/[0.04] h-7 px-2 text-xs transition-colors"
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      )}

      {/* Edit mode */}
      {(isEditing || !hasPhoneNumber) && (
        <div className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium text-white/40">
              Mobile number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 555-123-4567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
              }}
              className="h-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl transition-all text-sm"
            />
            <p className="text-[11px] text-white/20">
              Include country code (e.g. +91 for India, +1 for USA)
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-green-500/[0.08] border border-green-500/20 text-green-400 text-xs">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              Phone number saved
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-9 bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white font-medium rounded-xl border-0 transition-colors text-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save number"
              )}
            </Button>
            {hasPhoneNumber && isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setError(null)
                }}
                variant="ghost"
                disabled={isSaving}
                className="h-9 text-white/40 hover:text-white hover:bg-white/[0.04] rounded-xl text-sm"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
