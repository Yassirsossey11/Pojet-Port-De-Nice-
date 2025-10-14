"use client"

import { useState, useEffect } from "react"
import { ArrivalForm } from "@/components/arrival-form"
import { DepartureForm } from "@/components/departure-form"
import { CurrentBoatsList } from "@/components/current-boats-list"
import { AllBoatsList } from "@/components/all-boats-list"
import { StatsDashboard } from "@/components/stats-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ship, Waves, Anchor, LogOut } from "lucide-react"

type FilterType = 'all' | 'a_quai' | 'en_mer' | 'mouvements'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [filter, setFilter] = useState<FilterType>('a_quai')

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    // Faire défiler vers la section des bateaux
    setTimeout(() => {
      const boatsSection = document.getElementById('boats-section')
      if (boatsSection) {
        boatsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + A pour Arrivée
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        document.getElementById('arrival-tab')?.click()
      }
      // Alt + D pour Départ
      if (e.altKey && e.key === 'd') {
        e.preventDefault()
        document.getElementById('departure-tab')?.click()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Waves className="h-10 w-10 text-primary" />
                <Ship className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-primary">Port de Nice</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Gestion des mouvements de bateaux
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground hidden md:block">
              <p>Fuseau horaire: Europe/Paris (CET)</p>
              <p className="mt-1">
                <kbd className="px-1 py-0.5 bg-muted rounded">Alt+A</kbd> Arrivée |{" "}
                <kbd className="px-1 py-0.5 bg-muted rounded">Alt+D</kbd> Départ
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="space-y-6 md:space-y-8">
          {/* Stats Dashboard */}
          <StatsDashboard refreshKey={refreshKey} onFilterChange={handleFilterChange} />

          {/* Forms and Lists */}
          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            {/* Forms */}
            <div className="space-y-6">
              <Tabs defaultValue="arrival" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="arrival" id="arrival-tab">
                    <Anchor className="h-4 w-4 mr-2" />
                    Arrivée
                  </TabsTrigger>
                  <TabsTrigger value="departure" id="departure-tab">
                    <LogOut className="h-4 w-4 mr-2" />
                    Départ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="arrival" className="mt-4">
                  <ArrivalForm onSuccess={handleUpdate} />
                </TabsContent>

                <TabsContent value="departure" className="mt-4">
                  <DepartureForm onSuccess={handleUpdate} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Boats List */}
            <div className="lg:col-span-2" id="boats-section">
              <div className="mb-4">
                <h2 className="text-xl font-bold">
                  {filter === 'a_quai' && 'Bateaux à quai'}
                  {filter === 'en_mer' && 'Bateaux en mer'}
                  {filter === 'all' && 'Tous les bateaux'}
                  {filter === 'mouvements' && 'Historique des mouvements'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filter === 'a_quai' && 'Bateaux actuellement au Port de Nice'}
                  {filter === 'en_mer' && 'Bateaux ayant quitté le port'}
                  {filter === 'all' && 'Liste complète de tous les bateaux enregistrés'}
                  {filter === 'mouvements' && 'Historique complet des arrivées et départs'}
                </p>
              </div>
              
              {filter === 'all' || filter === 'mouvements' ? (
                <AllBoatsList refreshKey={refreshKey} />
              ) : (
                <CurrentBoatsList refreshKey={refreshKey} filter={filter} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Port de Nice - Système de gestion des mouvements maritimes</p>
          <p className="mt-2">
            Construit avec Next.js 14, TypeScript, Prisma & PostgreSQL
          </p>
        </div>
      </footer>
    </div>
  )
}
