import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DepartSchema } from '@/lib/validations'
import logger from '@/lib/logger'
import { nowInParis } from '@/lib/date-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { createAuditLog } from '@/lib/audit'

// POST /api/departures - Enregistrer un départ
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = checkRateLimit(request)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        },
      }
    )
  }

  try {
    const body = await request.json()
    
    // Validation avec Zod
    const validation = DepartSchema.safeParse(body)
    
    if (!validation.success) {
      logger.warn({ errors: validation.error.errors }, 'Validation échouée')
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Trouver le bateau avec son mouvement actif
    const bateau = await prisma.bateau.findUnique({
      where: { numeroSerie: data.numeroSerie },
      include: {
        mouvements: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!bateau) {
      logger.warn({ numeroSerie: data.numeroSerie }, 'Bateau non trouvé')
      return NextResponse.json(
        { error: 'Bateau non trouvé' },
        { status: 404 }
      )
    }

    if (!bateau.mouvements || bateau.mouvements.length === 0) {
      logger.warn(
        { numeroSerie: data.numeroSerie },
        'Aucun mouvement actif trouvé'
      )
      return NextResponse.json(
        { error: 'Ce bateau n\'est pas actuellement à quai' },
        { status: 404 }
      )
    }

    const activeMovement = bateau.mouvements[0]
    const departureTime = nowInParis()

    // Vérifier que departureAt >= arrivalAt
    if (activeMovement.arrivalAt && departureTime < activeMovement.arrivalAt) {
      return NextResponse.json(
        {
          error: 'Date de départ invalide',
          details: 'La date de départ ne peut pas être antérieure à la date d\'arrivée',
        },
        { status: 422 }
      )
    }

    // Mettre à jour le mouvement
    const updatedMovement = await prisma.movement.update({
      where: { id: activeMovement.id },
      data: {
        departureAt: departureTime,
        isActive: false,
        notes: data.notes || activeMovement.notes,
      },
    })

    // Audit log
    await createAuditLog({
      action: 'DEPARTURE',
      entity: 'Movement',
      entityId: updatedMovement.id,
      changes: { numeroSerie: data.numeroSerie, departureAt: departureTime },
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    logger.info(
      {
        bateauId: bateau.id,
        movementId: updatedMovement.id,
        numeroSerie: bateau.numeroSerie,
      },
      'Départ enregistré'
    )

    return NextResponse.json({
      message: 'Départ enregistré avec succès',
      bateau,
      movement: updatedMovement,
    })
  } catch (error: any) {
    logger.error({ error }, 'Erreur lors de l\'enregistrement du départ')
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'enregistrement du départ' },
      { status: 500 }
    )
  }
}

