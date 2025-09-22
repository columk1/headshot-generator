import { ArrowRight } from "lucide-react"

interface BeforeAfterProps {
  beforeImage: string
  afterImage: string
  beforeAlt?: string
  afterAlt?: string
  className?: string
}

export function BeforeAfter({
  beforeImage,
  afterImage,
  beforeAlt = "Before photo",
  afterAlt = "After photo",
  className = "",
}: BeforeAfterProps) {
  return (
    <div className={`flex items-center gap-8 ${className}`}>
      {/* Before Image */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl">
          <img src={beforeImage || "/placeholder.svg"} alt={beforeAlt} className="h-80 w-64 rounded-3xl object-cover" />
          <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1">
            <span className="text-sm font-medium text-white">Before</span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0">
        <ArrowRight className="h-8 w-8 text-gray-600" strokeWidth={2} />
      </div>

      {/* After Image */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-3xl">
          <img src={afterImage || "/placeholder.svg"} alt={afterAlt} className="h-80 w-64 rounded-3xl object-cover" />
          <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1">
            <span className="text-sm font-medium text-white">After</span>
          </div>
        </div>
      </div>
    </div>
  )
}
