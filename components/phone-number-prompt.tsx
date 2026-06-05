"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function PhoneNumberPrompt() {
  const [open, setOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const checkPhone = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from("profiles")
          .select("phone_number")
          .eq("id", user.id)
          .single()

        if (!profile?.phone_number) {
          setOpen(true)
        }
      } catch {
        // silently fail
      } finally {
        setChecked(true)
      }
    }

    checkPhone()
  }, [])

  const handleSave = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number")
      return
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phoneNumber) || phoneNumber.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number with country code")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Not authenticated")
        setIsSaving(false)
        return
      }

      const upsertPayload: any = { id: user.id, phone_number: phoneNumber }
      if (user.email) upsertPayload.email = user.email

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(upsertPayload)
        .select()
        .single()

      if (upsertError) {
        setError(upsertError.message)
      } else {
        setOpen(false)
      }
    } catch (err: any) {
      setError(err.message || "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  if (!checked) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-[oklch(0.13_0.008_270)] border-white/[0.08] text-white max-w-sm p-0 overflow-hidden">
        {/* Header visual */}
        <div className="relative px-6 pt-8 pb-4">
          <div className="absolute inset-0 bg-[oklch(0.55_0.25_280)]/5" />
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-[oklch(0.55_0.25_280)]/15 border border-[oklch(0.55_0.25_280)]/20 flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight text-white">
                Add your phone number
              </DialogTitle>
              <DialogDescription className="text-white/35 text-sm">
                We need your number to make accountability calls. You can change it anytime from your profile.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-prompt" className="text-xs font-medium text-white/50">
              Phone number
            </Label>
            <Input
              id="phone-prompt"
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
              className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl transition-all"
              autoFocus
            />
            <p className="text-[11px] text-white/25">
              Include country code (e.g. +91 for India, +1 for USA)
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-11 bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white font-medium rounded-xl border-0 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <button
            onClick={() => setOpen(false)}
            className="w-full text-center text-xs text-white/20 hover:text-white/40 transition-colors py-1"
          >
            I&apos;ll do this later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
