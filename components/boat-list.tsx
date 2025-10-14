"use client"

import { useEffect, useState } from "react"
import { BoatCard } from "./boat-card"
import { Input } from "@/ui/input"
import { Search } from "lucide-react"

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

export function BoatList({ type }: { type: "current" | "history" }) {
  const [bateaux, setBateaux] = useState<Bateau[]>([])
  const [filteredBateaux, setFilteredBateaux] = useState<Bateau[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchBateaux = async () => {
    setLoading(true)
    try {
      const endpoint = type === "current" ? "/api/boats/current" : "/api/boats/history"
      const response = await fetch(endpoint)
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
  }, [type])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBateaux(bateaux)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = bateaux.filter(
        (bateau) =>
          bateau.numeroSerie.toLowerCase().includes(query) ||
          bateau.nomBateau.toLowerCase().includes(query) ||
          bateau.typeBateau?.toLowerCase().includes(query)
      )
      setFilteredBateaux(filtered)
    }
  }, [searchQuery, bateaux])

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
          placeholder="Rechercher par numéro de série, nom ou type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredBateaux.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? "Aucun bateau trouvé" : "Aucun bateau à afficher"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBateaux.map((bateau) => (
            <BoatCard key={bateau.id} bateau={bateau} onUpdate={fetchBateaux} />
          ))}
        </div>
      )}
    </div>
  )
}

