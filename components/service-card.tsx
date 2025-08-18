import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface ServiceCardProps {
  title: string
  icon: string
  image: string
  description: string
}

export function ServiceCard({ title, icon, image, description }: ServiceCardProps) {
  return (
    <Card className="service-card group cursor-pointer hover:scale-105 transition-all duration-300">
      <div className="service-card-image">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="service-card-content">
        <div className="service-card-icon">
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="service-card-title text-foreground group-hover:text-[#06C0B3] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
