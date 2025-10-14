"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { formatShortDate, formatTime, calculateDuration } from "@/lib/date-utils"
import { CountryFlag } from "@/components/country-flag"
import { Anchor, Calendar, Clock, Users, Ship, LogOut, Search, MapPin } from "lucide-react"

interface Bateau {
  id: string
  numeroSerie: string
  nomBateau: string
  pavillon?: string | null
  typeBateau?: string | null
  capacite?: number | null
  longueur?: number | null
  remarques?: string | null
  currentMovement?: {
    id: string
    arrivalAt: string
    berth?: string | null
    notes?: string | null
  } | null
}

type FilterType = 'all' | 'a_quai' | 'en_mer' | 'mouvements'

export function CurrentBoatsList({ 
  refreshKey, 
  filter = 'a_quai' 
}: { 
  refreshKey: number
  filter?: FilterType 
}) {
  const { toast } = useToast()
  const [bateaux, setBateaux] = useState<Bateau[]>([])
  const [filteredBateaux, setFilteredBateaux] = useState<Bateau[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchBateaux = async () => {
    setLoading(true)
    try {
      let endpoint = "/api/boats/current"
      
      // Changer l'endpoint selon le filtre
      if (filter === 'all' || filter === 'en_mer' || filter === 'mouvements') {
        endpoint = "/api/boats/history"
      }
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      // Filtrer selon le type
      let filtered = data
      if (filter === 'a_quai') {
        filtered = data.filter((b: any) => b.currentMovement || b.mouvements?.some((m: any) => m.isActive))
      } else if (filter === 'en_mer') {
        filtered = data.filter((b: any) => !b.currentMovement && !b.mouvements?.some((m: any) => m.isActive))
      }
      
      setBateaux(filtered)
      setFilteredBateaux(filtered)
    } catch (error) {
      console.error("Error fetching boats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBateaux()
  }, [refreshKey, filter])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBateaux(bateaux)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = bateaux.filter(
        (bateau) =>
          bateau.numeroSerie.toLowerCase().includes(query) ||
          bateau.nomBateau.toLowerCase().includes(query) ||
          bateau.pavillon?.toLowerCase().includes(query) ||
          bateau.typeBateau?.toLowerCase().includes(query) ||
          bateau.currentMovement?.berth?.toLowerCase().includes(query)
      )
      setFilteredBateaux(filtered)
    }
  }, [searchQuery, bateaux])

  const handleDepart = async (bateau: Bateau) => {
    if (!confirm(`Êtes-vous sûr de vouloir enregistrer le départ de ${bateau.nomBateau} ?`)) {
      return
    }

    try {
      const response = await fetch("/api/departures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroSerie: bateau.numeroSerie }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement du départ")
      }

      toast({
        title: "✅ Départ enregistré",
        description: `Le bateau ${bateau.nomBateau} a quitté le port.`,
      })

      fetchBateaux()
    } catch (error: any) {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro, nom, poste..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredBateaux.length} bateau{filteredBateaux.length > 1 ? 'x' : ''} à quai
      </div>

      {filteredBateaux.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Aucun bateau trouvé" : "Aucun bateau à quai"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBateaux.map((bateau) => (
            <Card key={bateau.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{bateau.nomBateau}</h3>
                      <Badge variant="success">À quai</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Anchor className="h-4 w-4" />
                      <span className="font-mono">{bateau.numeroSerie}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {bateau.pavillon && (
                      <div className="flex items-center gap-3">
                        <CountryFlag country={bateau.pavillon} size="md" />
                        <span className="font-medium">{bateau.pavillon}</span>
                      </div>
                    )}

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

                    {bateau.currentMovement?.berth && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Poste {bateau.currentMovement.berth}</span>
                      </div>
                    )}

                    {bateau.currentMovement?.arrivalAt && (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatShortDate(bateau.currentMovement.arrivalAt)} à{" "}
                            {formatTime(bateau.currentMovement.arrivalAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Durée: {calculateDuration(bateau.currentMovement.arrivalAt)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    onClick={() => handleDepart(bateau)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Enregistrer le départ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

