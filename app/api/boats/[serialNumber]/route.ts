import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// GET /api/boats/[serialNumber] - Obtenir les détails d'un bateau
export async function GET(
  request: NextRequest,
  { params }: { params: { serialNumber: string } }
) {
  try {
    const { serialNumber } = params

    if (!serialNumber) {
      return NextResponse.json(
        { error: 'Numéro de série requis' },
        { status: 400 }
      )
    }

    const bateau = await prisma.bateau.findUnique({
      where: { numeroSerie: serialNumber.toUpperCase() },
      include: {
        mouvements: {
          orderBy: { arrivalAt: 'desc' },
        },
      },
    })

    if (!bateau) {
      return NextResponse.json(
        { error: 'Bateau non trouvé' },
        { status: 404 }
      )
    }

    // Déterminer le statut actuel
    const activeMovement = bateau.mouvements.find((m) => m.isActive)
    const statut = activeMovement ? 'A_QUAI' : 'EN_MER'

    logger.info({ numeroSerie: serialNumber }, 'Détails du bateau récupérés')

    return NextResponse.json({
      ...bateau,
      statut,
      currentMovement: activeMovement || null,
    })
  } catch (error) {
    logger.error({ error }, 'Erreur lors de la récupération du bateau')
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

