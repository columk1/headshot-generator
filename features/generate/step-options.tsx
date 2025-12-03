"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function StepOptions() {
  const [gender, setGender] = useState<string>("")
  const [age, setAge] = useState<string>("")
  const [hairColor, setHairColor] = useState<string>("")
  const [hairLength, setHairLength] = useState<string>("")
  const [ethnicity, setEthnicity] = useState<string>("")
  const [bodyType, setBodyType] = useState<string>("")
  const [attire, setAttire] = useState<string>("")
  const [background, setBackground] = useState<string>("White")

  const OptionButton = ({
    value,
    currentValue,
    onChange,
    children,
  }: {
    value: string
    currentValue: string
    onChange: (value: string) => void
    children: React.ReactNode
  }) => (
    <button
      type="button"
      className={cn(
        "px-4 py-2 rounded-md border-2 text-sm font-medium transition-colors",
        currentValue === value
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background hover:bg-muted border-input hover:border-muted-foreground",
      )}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  )

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6">Customize Your Headshot</h2>

        <div className="space-y-8">
          {/* Gender */}
          <div>
            <h3 className="text-base font-medium mb-3">What's your gender?</h3>
            <div className="flex flex-wrap gap-3">
              <OptionButton value="male" currentValue={gender} onChange={setGender}>
                Male
              </OptionButton>
              <OptionButton value="female" currentValue={gender} onChange={setGender}>
                Female
              </OptionButton>
            </div>
          </div>

          {/* Age */}
          <div>
            <h3 className="text-base font-medium mb-3">How old are you?</h3>
            <div className="flex flex-wrap gap-3">
              {["18-20", "21-24", "25-29", "30-40", "41-50", "51-65", "65+"].map((value) => (
                <OptionButton key={value} value={value} currentValue={age} onChange={setAge}>
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div>
            <h3 className="text-base font-medium mb-3">Hair color</h3>
            <div className="flex flex-wrap gap-3">
              {["Brown", "Black", "Blonde", "Gray", "Auburn", "Red", "White", "Other", "Bald"].map((value) => (
                <OptionButton key={value} value={value.toLowerCase()} currentValue={hairColor} onChange={setHairColor}>
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Hair Length */}
          <div>
            <h3 className="text-base font-medium mb-3">Hair length</h3>
            <div className="flex flex-wrap gap-3">
              {["Bald", "Buzzcut", "Short", "Medium length", "Long"].map((value) => (
                <OptionButton
                  key={value}
                  value={value.toLowerCase()}
                  currentValue={hairLength}
                  onChange={setHairLength}
                >
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Ethnicity */}
          <div>
            <h3 className="text-base font-medium mb-3">Ethnicity</h3>
            <div className="flex flex-wrap gap-3">
              {[
                "White / Caucasian",
                "Black/of African descent",
                "East or Central Asian",
                "Hispanic, Latino, Spanish origin",
                "Middle Eastern, North African, or Arab",
                "Multiracial",
                "Native Hawaiian or other Pacific Islander",
                "Southeast Asian (Vietnamese, Cambodian, etc.)",
                "South Asian (Indian, Pakistani, Bangladeshi, etc.)",
              ].map((value) => (
                <OptionButton key={value} value={value.toLowerCase()} currentValue={ethnicity} onChange={setEthnicity}>
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Body Type */}
          <div>
            <h3 className="text-base font-medium mb-3">Body type</h3>
            <div className="flex flex-wrap gap-3">
              {["Slim", "Regular", "Athletic", "Medium large", "Large", "Plus size"].map((value) => (
                <OptionButton key={value} value={value.toLowerCase()} currentValue={bodyType} onChange={setBodyType}>
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Attire */}
          <div>
            <h3 className="text-base font-medium mb-3">Select your attire</h3>
            <div className="flex flex-wrap gap-3">
              {["Business professional", "Business casual", "Smart casual"].map((value) => (
                <OptionButton key={value} value={value.toLowerCase()} currentValue={attire} onChange={setAttire}>
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <h3 className="text-base font-medium mb-3">Select your background</h3>
            <div className="flex flex-wrap gap-3">
              {["White", "Black", "Neutral", "Gray", "Office"].map((value) => (
                <OptionButton
                  key={value}
                  value={value.toLowerCase()}
                  currentValue={background}
                  onChange={setBackground}
                >
                  {value}
                </OptionButton>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
