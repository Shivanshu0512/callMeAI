"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Check, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function PhoneNumberSettings() {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user's phone number on mount
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("phone_number")
            .eq("id", user.id)
            .single()

          if (!profileError && profile?.phone_number) {
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

    // Basic validation: check if it looks like a phone number
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number")
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

      // Use upsert to create the profile row if it doesn't exist yet.
      // Include user's email when upserting to satisfy DB not-null constraint
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
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Phone Number</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  const hasPhoneNumber = phoneNumber.trim().length > 0

  return (
    <Card className={`border-0 shadow-lg backdrop-blur-sm ${
      hasPhoneNumber
        ? "bg-green-50/80 dark:bg-green-900/20 border-l-4 border-green-500"
        : "bg-yellow-50/80 dark:bg-yellow-900/20 border-l-4 border-yellow-500"
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Phone className={`w-5 h-5 ${hasPhoneNumber ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`} />
            <CardTitle className="text-lg text-gray-900 dark:text-white">Phone Number</CardTitle>
            {hasPhoneNumber && (
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
          </div>
        </div>
        <CardDescription className={hasPhoneNumber ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"}>
          {hasPhoneNumber ? "Your phone number is saved" : "Add your phone number to receive calls"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing && hasPhoneNumber && (
          <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{phoneNumber}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              Edit
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Mobile Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210 or +1 555-123-4567"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  setError(null)
                }}
                className="text-base"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Include country code (e.g., +91 for India, +1 for USA)
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start space-x-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300">
                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">Phone number saved successfully!</p>
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              {hasPhoneNumber && (
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                  }}
                  variant="outline"
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}

        {!isEditing && !hasPhoneNumber && (
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Add Phone Number
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
