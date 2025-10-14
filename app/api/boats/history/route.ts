import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// GET /api/boats/history - Historique complet de tous les bateaux
export async function GET() {
  try {
    const bateaux = await prisma.bateau.findMany({
      include: {
        mouvements: {
          orderBy: { arrivalAt: 'desc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    logger.info({ count: bateaux.length }, 'Historique complet récupéré')

    return NextResponse.json(bateaux)
  } catch (error) {
    logger.error({ error }, 'Erreur lors de la récupération de l\'historique')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération de l\'historique' },
      { status: 500 }
    )
  }
}
