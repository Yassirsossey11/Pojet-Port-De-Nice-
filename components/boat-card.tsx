"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/ui/card"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { useToast } from "@/hooks/use-toast"
import { formatDateWithTimezone, formatShortDate, formatTime, calculateDuration } from "@/lib/date-utils"
import { Anchor, Calendar, Clock, Users, Ship, LogOut } from "lucide-react"

interface Bateau {
  id: string
  numeroSerie: string
  nomBateau: string
  typeBateau?: string | null
  capacite?: number | null
  dateArrivee: string
  dateDepart?: string | null
  statut: "A_QUAI" | "PARTI"
  remarques?: string | null
}

export function BoatCard({ bateau, onUpdate }: { bateau: Bateau; onUpdate?: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleDepart = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir enregistrer le départ de ${bateau.nomBateau} ?`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/boats/${bateau.numeroSerie}/depart`, {
        method: "PUT",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement du départ")
      }

      toast({
        title: "✅ Départ enregistré",
        description: `Le bateau ${bateau.nomBateau} a quitté le port.`,
      })

      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">{bateau.nomBateau}</h3>
              <Badge variant={bateau.statut === "A_QUAI" ? "success" : "secondary"}>
                {bateau.statut === "A_QUAI" ? "À quai" : "Parti"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Anchor className="h-4 w-4" />
              <span className="font-mono">{bateau.numeroSerie}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {bateau.typeBateau && (
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4 text-muted-foreground" />
              <span>{bateau.typeBateau}</span>
            </div>
          )}

          {bateau.capacite && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{bateau.capacite} passagers</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Arrivée: {formatShortDate(bateau.dateArrivee)} à {formatTime(bateau.dateArrivee)}</span>
          </div>

          {bateau.dateDepart && (
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              <span>Départ: {formatShortDate(bateau.dateDepart)} à {formatTime(bateau.dateDepart)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              Durée: {calculateDuration(bateau.dateArrivee, bateau.dateDepart)}
            </span>
          </div>

          {bateau.remarques && (
            <div className="mt-3 p-2 bg-muted rounded text-sm">
              <p className="text-muted-foreground">{bateau.remarques}</p>
            </div>
          )}
        </div>
      </CardContent>

      {bateau.statut === "A_QUAI" && (
        <CardFooter>
          <Button
            onClick={handleDepart}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Enregistrement..." : "Enregistrer le départ"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

