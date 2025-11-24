"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CallLiveLogs } from "@/components/call-live-logs"
import { Phone, Loader2 } from "lucide-react"

interface BlandCallDialogProps {
  children: React.ReactNode
  scheduleId: string
  scheduleName: string
}

export function BlandCallDialog({ children, scheduleId, scheduleName }: BlandCallDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "completed" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [callId, setCallId] = useState<string | null>(null)

  const initiateCall = async () => {
    setIsLoading(true)
    setError(null)
    setCallStatus("calling")

    try {
      const response = await fetch("/api/bland/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If the server returned Bland.ai details, show that message
        const detailsMsg = data?.message || (data?.details && JSON.stringify(data.details)) || data.error || "Failed to initiate call"
        setError(detailsMsg)
        setCallStatus("error")
        setIsLoading(false)
        return
      }

      setCallId(data.callId)
      // keep status as calling while the call is live; stream will update status via realtime
      setCallStatus("calling")
    } catch (err: any) {
      setError(err.message)
      setCallStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  const resetDialog = () => {
    setCallStatus("idle")
    setError(null)
    setCallId(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetDialog()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make a Call</DialogTitle>
          <DialogDescription>Initiate a call for "{scheduleName}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {callStatus === "idle" && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Ready to call?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A call will be initiated to your registered phone number. You'll be asked about your daily tasks and goals.
                </p>
                <Button
                  onClick={initiateCall}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initiating...
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Me Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {callStatus === "calling" && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Calling...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Connecting you to CallMeAI. Please keep your phone nearby.
                </p>
              </CardContent>
            </Card>
          )}

          {callId && (
            <div>
              <CallLiveLogs callId={callId} />
            </div>
          )}

          {callStatus === "error" && (
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-700 dark:text-red-400">Error</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                <Button
                  onClick={() => {
                    resetDialog()
                    setCallStatus("idle")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
