"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Lock } from "lucide-react"

export default function StepPayment() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-6">
            <Lock className="size-5 text-muted-foreground mr-2" />
            <p className="text-sm text-muted-foreground">Secure Payment</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Complete Your Purchase</h2>
            <p className="text-muted-foreground">
              You're almost there! Complete your payment to generate your professional headshots.
            </p>
          </div>

          <div className="border rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-medium">Single Headshot</h3>
                <p className="text-sm text-muted-foreground">Professional AI-generated headshot</p>
              </div>
              <p className="font-medium">$29.00</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <Check className="size-4 text-primary mr-2" />
                <span className="text-sm">High-resolution download</span>
              </div>
              <div className="flex items-center">
                <Check className="size-4 text-primary mr-2" />
                <span className="text-sm">5 background options</span>
              </div>
              <div className="flex items-center">
                <Check className="size-4 text-primary mr-2" />
                <span className="text-sm">Commercial usage rights</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>$29.00</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm text-center">
              This is where the Stripe payment form would be integrated. For now, we'll use a placeholder button.
            </p>
          </div>

          <Button className="w-full rounded-full" size="lg">
            <CreditCard className="mr-2 size-4" />
            Pay $29.00
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By completing this purchase, you agree to our Terms of Service and Privacy Policy. Your payment information
            is encrypted and secure.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
