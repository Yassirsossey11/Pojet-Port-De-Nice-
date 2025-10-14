import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

// GET /api/boats/search?q=... - Rechercher des bateaux (autocomplete)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Paramètre de recherche requis' },
        { status: 400 }
      )
    }

    // Rechercher dans le numéro de série et le nom du bateau
    const bateaux = await prisma.bateau.findMany({
      where: {
        OR: [
          { numeroSerie: { contains: query } },
          { nomBateau: { contains: query } },
          { pavillon: { contains: query } },
          { typeBateau: { contains: query } },
        ],
      },
      include: {
        mouvements: {
          where: { isActive: true },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10, // Limiter à 10 résultats pour l'autocomplete
    })

    // Ajouter le statut actuel
    const bateauxWithStatus = bateaux.map((bateau) => ({
      ...bateau,
      statut: bateau.mouvements.length > 0 ? 'A_QUAI' : 'EN_MER',
      currentMovement: bateau.mouvements[0] || null,
      mouvements: undefined,
    }))

    logger.info({ query, count: bateaux.length }, 'Recherche effectuée')

    return NextResponse.json(bateauxWithStatus)
  } catch (error) {
    logger.error({ error }, 'Erreur lors de la recherche')
    return NextResponse.json(
      { error: 'Erreur serveur lors de la recherche' },
      { status: 500 }
    )
  }
}
