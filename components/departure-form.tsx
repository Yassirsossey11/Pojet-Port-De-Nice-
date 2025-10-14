"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { CountryFlag } from "@/components/country-flag"
import { LogOut, Search } from "lucide-react"

export function DepartureForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [formData, setFormData] = useState({
    numeroSerie: "",
    notes: "",
  })
  const [boatInfo, setBoatInfo] = useState<any>(null)

  const handleSerialNumberChange = async (value: string) => {
    const upperValue = value.toUpperCase()
    setFormData({ ...formData, numeroSerie: upperValue })
    setBoatInfo(null)

    // Autocomplete si au moins 3 caractères
    if (upperValue.length >= 3) {
      setSearching(true)
      try {
        const response = await fetch(`/api/boats/search?q=${encodeURIComponent(upperValue)}`)
        const results = await response.json()
        
        if (results.length > 0) {
          const boat = results[0]
          setBoatInfo(boat)
          
          if (boat.statut !== 'A_QUAI') {
            toast({
              title: "⚠️ Attention",
              description: "Ce bateau n'est pas actuellement à quai",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setSearching(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        numeroSerie: formData.numeroSerie,
        notes: formData.notes || undefined,
      }

      const response = await fetch("/api/departures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement")
      }

      toast({
        title: "✅ Départ enregistré",
        description: `Le bateau ${result.bateau.nomBateau} a quitté le port.`,
      })

      // Reset form
      setFormData({
        numeroSerie: "",
        notes: "",
      })
      setBoatInfo(null)

      onSuccess?.()
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogOut className="h-5 w-5" />
          Enregistrer un départ
        </CardTitle>
        <CardDescription>
          Enregistrez le départ d'un bateau du Port de Nice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroSerie">Numéro de série * <kbd className="ml-2 text-xs">D</kbd></Label>
            <div className="relative">
              <Input
                id="numeroSerie"
                placeholder="Ex: FR-12345-A"
                value={formData.numeroSerie}
                onChange={(e) => handleSerialNumberChange(e.target.value)}
                required
                pattern="[A-Z0-9-]+"
                title="Uniquement lettres majuscules, chiffres et tirets"
                autoFocus
              />
              {searching && (
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>
          </div>

          {boatInfo && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-semibold">{boatInfo.nomBateau}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {boatInfo.pavillon && (
                  <p className="flex items-center gap-3">
                    <CountryFlag country={boatInfo.pavillon} size="sm" />
                    <span>Pavillon: {boatInfo.pavillon}</span>
                  </p>
                )}
                {boatInfo.typeBateau && <p>Type: {boatInfo.typeBateau}</p>}
                {boatInfo.currentMovement?.berth && (
                  <p>Poste: {boatInfo.currentMovement.berth}</p>
                )}
                <p className="font-medium">
                  Statut: {boatInfo.statut === 'A_QUAI' ? '✅ À quai' : '❌ Pas à quai'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes sur ce départ..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (boatInfo && boatInfo.statut !== 'A_QUAI')}
          >
            {loading ? "Enregistrement..." : "Enregistrer le départ"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

