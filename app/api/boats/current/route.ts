import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// GET /api/boats/current - Liste des bateaux actuellement à quai
export async function GET() {
  try {
    const bateaux = await prisma.bateau.findMany({
      where: {
        mouvements: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        mouvements: {
          where: { isActive: true },
          orderBy: { arrivalAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Transformer les données pour inclure les infos du mouvement actif
    const bateauxWithMovement = bateaux.map((bateau) => ({
      ...bateau,
      currentMovement: bateau.mouvements[0] || null,
      mouvements: undefined, // Retirer le tableau mouvements de la réponse
    }))

    logger.info({ count: bateaux.length }, 'Bateaux à quai récupérés')

    return NextResponse.json(bateauxWithMovement)
  } catch (error) {
    logger.error({ error }, 'Erreur lors de la récupération des bateaux à quai')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des bateaux à quai' },
      { status: 500 }
    )
  }
}
