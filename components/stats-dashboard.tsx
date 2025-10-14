"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ship, Anchor, TrendingUp, Activity } from "lucide-react"
import { formatShortDate, formatTime } from "@/lib/date-utils"

type FilterType = 'all' | 'a_quai' | 'en_mer' | 'mouvements'

interface Stats {
  totalBateaux: number
  bateauxAQuai: number
  bateauxPartis: number
  totalMouvements: number
  mouvementsActifs: number
  dernierArrivees: Array<{
    id: string
    arrivalAt: string
    bateau: {
      numeroSerie: string
      nomBateau: string
    }
  }>
  derniersDeparts: Array<{
    id: string
    departureAt: string
    bateau: {
      numeroSerie: string
      nomBateau: string
    }
  }>
}

export function StatsDashboard({ 
  refreshKey, 
  onFilterChange 
}: { 
  refreshKey: number
  onFilterChange?: (filter: FilterType) => void 
}) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [refreshKey])

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${activeFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bateaux</CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBateaux}</div>
            <p className="text-xs text-muted-foreground">
              Cliquez pour voir tous
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${activeFilter === 'a_quai' ? 'ring-2 ring-green-600' : ''}`}
          onClick={() => handleFilterClick('a_quai')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À quai</CardTitle>
            <Anchor className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.bateauxAQuai}</div>
            <p className="text-xs text-muted-foreground">
              Cliquez pour filtrer
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${activeFilter === 'en_mer' ? 'ring-2 ring-blue-600' : ''}`}
          onClick={() => handleFilterClick('en_mer')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En mer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bateauxPartis}</div>
            <p className="text-xs text-muted-foreground">
              Cliquez pour filtrer
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${activeFilter === 'mouvements' ? 'ring-2 ring-orange-600' : ''}`}
          onClick={() => handleFilterClick('mouvements')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMouvements}</div>
            <p className="text-xs text-muted-foreground">
              Voir l'historique
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dernières arrivées</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats.dernierArrivees || stats.dernierArrivees.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune arrivée récente</p>
            ) : (
              <div className="space-y-3">
                {stats.dernierArrivees.map((movement) => (
                  <div key={movement.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium">{movement.bateau.nomBateau}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.bateau.numeroSerie}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{formatShortDate(movement.arrivalAt)}</p>
                      <p>{formatTime(movement.arrivalAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Derniers départs</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats.derniersDeparts || stats.derniersDeparts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun départ récent</p>
            ) : (
              <div className="space-y-3">
                {stats.derniersDeparts.map((movement) => (
                  <div key={movement.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium">{movement.bateau.nomBateau}</p>
                      <p className="text-xs text-muted-foreground">
                        {movement.bateau.numeroSerie}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{formatShortDate(movement.departureAt!)}</p>
                      <p>{formatTime(movement.departureAt!)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

