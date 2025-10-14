import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'
import { formatParisDate } from '@/lib/date-utils'

// GET /api/movements/export - Exporter les mouvements en CSV
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Construire les conditions WHERE
    const where: any = {}

    if (dateFrom || dateTo) {
      where.arrivalAt = {}
      if (dateFrom) where.arrivalAt.gte = new Date(dateFrom)
      if (dateTo) where.arrivalAt.lte = new Date(dateTo)
    }

    // Récupérer tous les mouvements (sans pagination)
    const movements = await prisma.movement.findMany({
      where,
      include: {
        bateau: true,
      },
      orderBy: {
        arrivalAt: 'desc',
      },
    })

    // Générer le CSV
    const headers = [
      'ID Mouvement',
      'Numéro de Série',
      'Nom du Bateau',
      'Pavillon',
      'Type',
      'Type Mouvement',
      'Date Arrivée (UTC)',
      'Date Arrivée (Local)',
      'Date Départ (UTC)',
      'Date Départ (Local)',
      'Poste',
      'Source',
      'Statut',
      'Notes',
    ]

    const rows = movements.map((movement) => [
      movement.id,
      movement.bateau.numeroSerie,
      movement.bateau.nomBateau,
      movement.bateau.pavillon || '',
      movement.bateau.typeBateau || '',
      movement.type,
      movement.arrivalAt?.toISOString() || '',
      movement.arrivalAt ? formatParisDate(movement.arrivalAt, 'dd/MM/yyyy HH:mm') : '',
      movement.departureAt?.toISOString() || '',
      movement.departureAt ? formatParisDate(movement.departureAt, 'dd/MM/yyyy HH:mm') : '',
      movement.berth || '',
      movement.source,
      movement.isActive ? 'Actif' : 'Terminé',
      movement.notes || '',
    ])

    // Construire le CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Ajouter le BOM UTF-8 pour Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    logger.info({ count: movements.length }, 'Export CSV généré')

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mouvements_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    logger.error({ error }, 'Erreur lors de l\'export CSV')
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'export' },
      { status: 500 }
    )
  }
}

