import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { JournalFiltersSchema } from '@/lib/validations'
import logger from '@/lib/logger'

// GET /api/movements - Journal des mouvements avec filtres et pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parser et valider les filtres
    const filters = JournalFiltersSchema.safeParse({
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      query: searchParams.get('query') || undefined,
      berth: searchParams.get('berth') || undefined,
      source: searchParams.get('source') || undefined,
      type: searchParams.get('type') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    })

    if (!filters.success) {
      return NextResponse.json(
        { error: 'Filtres invalides', details: filters.error.errors },
        { status: 400 }
      )
    }

    const { dateFrom, dateTo, query, berth, source, type, page, limit } = filters.data

    // Construire les conditions WHERE
    const where: any = {}

    if (dateFrom || dateTo) {
      where.arrivalAt = {}
      if (dateFrom) where.arrivalAt.gte = new Date(dateFrom)
      if (dateTo) where.arrivalAt.lte = new Date(dateTo)
    }

    if (berth) {
      where.berth = { contains: berth, mode: 'insensitive' }
    }

    if (source) {
      where.source = source
    }

    if (type) {
      where.type = type
    }

    if (query) {
      where.bateau = {
        OR: [
          { numeroSerie: { contains: query, mode: 'insensitive' } },
          { nomBateau: { contains: query, mode: 'insensitive' } },
        ],
      }
    }

    // Compter le total
    const total = await prisma.movement.count({ where })

    // Récupérer les mouvements avec pagination
    const movements = await prisma.movement.findMany({
      where,
      include: {
        bateau: true,
      },
      orderBy: {
        arrivalAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    logger.info(
      { filters: filters.data, total, count: movements.length },
      'Mouvements récupérés'
    )

    return NextResponse.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error({ error }, 'Erreur lors de la récupération des mouvements')
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

