"use client"

import { useState } from "react"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Textarea } from "@/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Anchor } from "lucide-react"

export function BoatForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    numeroSerie: "",
    nomBateau: "",
    typeBateau: "",
    capacite: "",
    remarques: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        numeroSerie: formData.numeroSerie.toUpperCase(),
        nomBateau: formData.nomBateau,
        typeBateau: formData.typeBateau || undefined,
        capacite: formData.capacite ? parseInt(formData.capacite) : undefined,
        remarques: formData.remarques || undefined,
      }

      const response = await fetch("/api/boats", {
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
        typeBateau: "",
        capacite: "",
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
          Enregistrez l'arrivée d'un nouveau bateau au Port de Nice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroSerie">Numéro de série *</Label>
            <Input
              id="numeroSerie"
              placeholder="Ex: FR-12345-A"
              value={formData.numeroSerie}
              onChange={(e) =>
                setFormData({ ...formData, numeroSerie: e.target.value.toUpperCase() })
              }
              required
              pattern="[A-Z0-9-]+"
              title="Uniquement lettres majuscules, chiffres et tirets"
            />
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
              <Label htmlFor="typeBateau">Type de bateau</Label>
              <Input
                id="typeBateau"
                placeholder="Ex: Yacht, Ferry"
                value={formData.typeBateau}
                onChange={(e) =>
                  setFormData({ ...formData, typeBateau: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacite">Capacité (passagers)</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarques">Remarques</Label>
            <Textarea
              id="remarques"
              placeholder="Informations supplémentaires..."
              value={formData.remarques}
              onChange={(e) =>
                setFormData({ ...formData, remarques: e.target.value })
              }
              rows={3}
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

