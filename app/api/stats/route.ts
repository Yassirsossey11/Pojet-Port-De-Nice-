import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// GET /api/stats - Statistiques globales
export async function GET() {
  try {
    const [
      totalBateaux,
      bateauxAQuai,
      totalMouvements,
      mouvementsActifs,
      dernierArrivees,
      derniersDeparts,
    ] = await Promise.all([
      // Total de bateaux enregistrés
      prisma.bateau.count(),
      
      // Bateaux actuellement à quai
      prisma.bateau.count({
        where: {
          mouvements: {
            some: {
              isActive: true,
            },
          },
        },
      }),
      
      // Total de mouvements
      prisma.movement.count(),
      
      // Mouvements actifs
      prisma.movement.count({
        where: { isActive: true },
      }),
      
      // 5 dernières arrivées
      prisma.movement.findMany({
        where: {
          type: 'ARRIVEE',
        },
        include: {
          bateau: true,
        },
        orderBy: {
          arrivalAt: 'desc',
        },
        take: 5,
      }),
      
      // 5 derniers départs
      prisma.movement.findMany({
        where: {
          type: 'ARRIVEE',
          departureAt: { not: null },
        },
        include: {
          bateau: true,
        },
        orderBy: {
          departureAt: 'desc',
        },
        take: 5,
      }),
    ])

    const stats = {
      totalBateaux,
      bateauxAQuai,
      bateauxPartis: totalBateaux - bateauxAQuai,
      totalMouvements,
      mouvementsActifs,
      dernierArrivees,
      derniersDeparts,
    }

    logger.info(stats, 'Statistiques récupérées')

    return NextResponse.json(stats)
  } catch (error) {
    logger.error({ error }, 'Erreur lors de la récupération des statistiques')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
