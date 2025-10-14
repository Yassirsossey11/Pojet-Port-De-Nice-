"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Anchor, Search } from "lucide-react"

export function ArrivalForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [formData, setFormData] = useState({
    numeroSerie: "",
    nomBateau: "",
    pavillon: "",
    typeBateau: "",
    capacite: "",
    longueur: "",
    berth: "",
    notes: "",
    remarques: "",
  })

  const handleSerialNumberChange = async (value: string) => {
    const upperValue = value.toUpperCase()
    setFormData({ ...formData, numeroSerie: upperValue })

    // Autocomplete si au moins 3 caractères
    if (upperValue.length >= 3) {
      setSearching(true)
      try {
        const response = await fetch(`/api/boats/search?q=${encodeURIComponent(upperValue)}`)
        const results = await response.json()
        
        if (results.length > 0) {
          const boat = results[0]
          // Pré-remplir le formulaire avec les données existantes
          setFormData({
            ...formData,
            numeroSerie: upperValue,
            nomBateau: boat.nomBateau || "",
            pavillon: boat.pavillon || "",
            typeBateau: boat.typeBateau || "",
            capacite: boat.capacite?.toString() || "",
            longueur: boat.longueur?.toString() || "",
            remarques: boat.remarques || "",
            berth: "",
            notes: boat.statut === 'A_QUAI' ? `⚠️ Ce bateau est déjà à quai` : "",
          })

          if (boat.statut === 'A_QUAI') {
            toast({
              title: "⚠️ Attention",
              description: "Ce bateau est déjà enregistré comme étant à quai",
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
        nomBateau: formData.nomBateau,
        pavillon: formData.pavillon || undefined,
        typeBateau: formData.typeBateau || undefined,
        capacite: formData.capacite ? parseInt(formData.capacite) : undefined,
        longueur: formData.longueur ? parseFloat(formData.longueur) : undefined,
        berth: formData.berth || undefined,
        notes: formData.notes || undefined,
        remarques: formData.remarques || undefined,
        source: "MANUAL",
      }

      const response = await fetch("/api/arrivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement")
      }

      toast({
        title: "✅ Arrivée enregistrée",
        description: `Le bateau ${data.nomBateau} a été enregistré avec succès.`,
      })

      // Reset form
      setFormData({
        numeroSerie: "",
        nomBateau: "",
        pavillon: "",
        typeBateau: "",
        capacite: "",
        longueur: "",
        berth: "",
        notes: "",
        remarques: "",
      })

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
          <Anchor className="h-5 w-5" />
          Enregistrer une arrivée
        </CardTitle>
        <CardDescription>
          Enregistrez l'arrivée d'un bateau au Port de Nice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroSerie">Numéro de série * <kbd className="ml-2 text-xs">A</kbd></Label>
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

          <div className="space-y-2">
            <Label htmlFor="nomBateau">Nom du bateau *</Label>
            <Input
              id="nomBateau"
              placeholder="Ex: La Méditerranée"
              value={formData.nomBateau}
              onChange={(e) =>
                setFormData({ ...formData, nomBateau: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pavillon">Pavillon (Pays)</Label>
            <Input
              id="pavillon"
              placeholder="Ex: France, Italie, Monaco..."
              value={formData.pavillon}
              onChange={(e) =>
                setFormData({ ...formData, pavillon: e.target.value })
              }
              list="countries"
            />
            <datalist id="countries">
              <option value="France" />
              <option value="Italie" />
              <option value="Espagne" />
              <option value="Monaco" />
              <option value="Royaume-Uni" />
              <option value="Grèce" />
              <option value="Allemagne" />
              <option value="Portugal" />
              <option value="Pays-Bas" />
              <option value="États-Unis" />
              <option value="Canada" />
              <option value="Japon" />
              <option value="Australie" />
              <option value="Maroc" />
              <option value="Tunisie" />
            </datalist>
          </div>

            <div className="space-y-2">
              <Label htmlFor="typeBateau">Type</Label>
              <Input
                id="typeBateau"
                placeholder="Ex: Yacht"
                value={formData.typeBateau}
                onChange={(e) =>
                  setFormData({ ...formData, typeBateau: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacite">Capacité</Label>
              <Input
                id="capacite"
                type="number"
                min="1"
                placeholder="Ex: 100"
                value={formData.capacite}
                onChange={(e) =>
                  setFormData({ ...formData, capacite: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longueur">Longueur (m)</Label>
              <Input
                id="longueur"
                type="number"
                min="1"
                step="0.1"
                placeholder="Ex: 25.5"
                value={formData.longueur}
                onChange={(e) =>
                  setFormData({ ...formData, longueur: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="berth">Poste</Label>
              <Input
                id="berth"
                placeholder="Ex: A12"
                value={formData.berth}
                onChange={(e) =>
                  setFormData({ ...formData, berth: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes du mouvement</Label>
            <Textarea
              id="notes"
              placeholder="Notes spécifiques à cette arrivée..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarques">Remarques générales sur le bateau</Label>
            <Textarea
              id="remarques"
              placeholder="Informations générales..."
              value={formData.remarques}
              onChange={(e) =>
                setFormData({ ...formData, remarques: e.target.value })
              }
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer l'arrivée"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

