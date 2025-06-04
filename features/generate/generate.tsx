"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"
import StepOptions from "./step-options"
import StepUpload from "./step-upload"
import StepPayment from "./step-payment"

export default function GeneratePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = searchParams.get("step")

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isOver18, setIsOver18] = useState(false)

  // Reset state when navigating directly to this page
  useEffect(() => {
    if (!step) {
      setAgreedToTerms(false)
      setIsOver18(false)
    }
  }, [step])

  const steps = ["start", "options", "upload", "payment"]
  const currentStepIndex = step ? steps.indexOf(step) : 0

  const goToStep = (stepName: string) => {
    router.push(`/dashboard/generate?step=${stepName}`)
  }

  const handleContinue = () => {
    if (!step) {
      if (isOver18 && agreedToTerms) {
        goToStep("options")
      }
    } else {
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < steps.length) {
        goToStep(steps[nextStepIndex])
      }
    }
  }

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      goToStep(steps[prevStepIndex])
    } else {
      router.push("/dashboard/generate")
    }
  }

  // Update the renderProgressBar function to show correct step numbers and percentages
  const renderProgressBar = () => {
    if (!step) return null

    // Calculate the correct step number (1-indexed)
    const stepNumber = currentStepIndex + 1

    // Calculate progress based on completed steps (previous steps)
    // Step 1: 0%, Step 2: 25%, Step 3: 50%, Step 4: 75%
    const progress = (currentStepIndex - 1) * 25

    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm">
          <span>Step {stepNumber} of 4</span>
          <span>{progress}% Complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  // Update the step numbering for the initial page
  const renderStepContent = () => {
    switch (step) {
      case "options":
        return <StepOptions />
      case "upload":
        return <StepUpload />
      case "payment":
        return <StepPayment />
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Before You Begin</h2>
              <p className="text-muted-foreground mb-6">
                Please confirm the following before proceeding with generating your professional headshot.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="over18"
                    checked={isOver18}
                    onCheckedChange={(checked) => setIsOver18(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="over18"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm that I am over 18 years of age
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      You must be at least 18 years old to use this service.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the Terms and Conditions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By checking this box, you agree to our{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full rounded-full" disabled={!isOver18 || !agreedToTerms} onClick={handleContinue}>
                Start
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        )
    }
  }

  // Update the initial page progress bar
  return (
    <div className="container py-6 md:py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Generate Headshot</h1>

      {!step ? (
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span>Step 1 of 4</span>
            <span>0% Complete</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: "0%" }} />
          </div>
        </div>
      ) : (
        renderProgressBar()
      )}

      {step && (
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="pl-0">
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
      )}

      {renderStepContent()}

      {step && step !== "payment" && (
        <div className="mt-8 flex justify-end">
          <Button className="rounded-full px-8" onClick={handleContinue}>
            Continue
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
