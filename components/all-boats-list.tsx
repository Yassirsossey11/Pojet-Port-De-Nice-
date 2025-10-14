"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatShortDate, formatTime } from "@/lib/date-utils"
import { CountryFlag } from "@/components/country-flag"
import { Anchor, Calendar, Ship, MapPin, Search } from "lucide-react"

interface Bateau {
  id: string
  numeroSerie: string
  nomBateau: string
  pavillon?: string | null
  typeBateau?: string | null
  capacite?: number | null
  mouvements?: Array<{
    id: string
    arrivalAt: string
    departureAt?: string | null
    berth?: string | null
    isActive: boolean
  }>
}

export function AllBoatsList({ refreshKey }: { refreshKey: number }) {
  const [bateaux, setBateaux] = useState<Bateau[]>([])
  const [filteredBateaux, setFilteredBateaux] = useState<Bateau[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchBateaux = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/boats/history")
      const data = await response.json()
      setBateaux(data)
      setFilteredBateaux(data)
    } catch (error) {
      console.error("Error fetching boats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBateaux()
  }, [refreshKey])

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
          bateau.typeBateau?.toLowerCase().includes(query)
      )
      setFilteredBateaux(filtered)
    }
  }, [searchQuery, bateaux])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  const getStatut = (bateau: Bateau) => {
    const hasActiveMovement = bateau.mouvements?.some(m => m.isActive)
    return hasActiveMovement ? 'A_QUAI' : 'EN_MER'
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro, nom, pavillon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredBateaux.length} bateau{filteredBateaux.length > 1 ? 'x' : ''} trouvé{filteredBateaux.length > 1 ? 's' : ''}
      </div>

      {filteredBateaux.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Aucun bateau trouvé" : "Aucun bateau enregistré"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBateaux.map((bateau) => {
            const statut = getStatut(bateau)
            const lastMovement = bateau.mouvements?.[0]
            
            return (
              <Card key={bateau.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold">{bateau.nomBateau}</h3>
                        <Badge variant={statut === 'A_QUAI' ? 'success' : 'secondary'}>
                          {statut === 'A_QUAI' ? 'À quai' : 'En mer'}
                        </Badge>
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

                      {lastMovement && (
                        <>
                          {lastMovement.berth && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>Poste {lastMovement.berth}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {lastMovement.isActive ? 'Arrivé' : 'Dernier passage'} le{" "}
                              {formatShortDate(lastMovement.arrivalAt)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

