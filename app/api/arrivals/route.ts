import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ArriveeSchema } from '@/lib/validations'
import logger from '@/lib/logger'
import { nowInParis } from '@/lib/date-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { createAuditLog } from '@/lib/audit'

// POST /api/arrivals - Enregistrer une arrivée
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
    const validation = ArriveeSchema.safeParse(body)
    
    if (!validation.success) {
      logger.warn({ errors: validation.error.errors }, 'Validation échouée')
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Vérifier s'il y a déjà un mouvement actif pour ce bateau
    const existingBateau = await prisma.bateau.findUnique({
      where: { numeroSerie: data.numeroSerie },
      include: {
        mouvements: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (existingBateau && existingBateau.mouvements.length > 0) {
      logger.warn(
        { numeroSerie: data.numeroSerie },
        'Mouvement actif déjà existant'
      )
      return NextResponse.json(
        {
          error: 'Ce bateau est déjà à quai',
          details: 'Un mouvement actif existe déjà pour ce bateau',
        },
        { status: 409 }
      )
    }

    const arrivalTime = nowInParis()

    // Transaction: Créer ou mettre à jour le bateau + créer le mouvement
    const result = await prisma.$transaction(async (tx) => {
      // Créer ou mettre à jour le bateau
      const bateau = await tx.bateau.upsert({
        where: { numeroSerie: data.numeroSerie },
        create: {
          numeroSerie: data.numeroSerie,
          nomBateau: data.nomBateau,
          pavillon: data.pavillon,
          typeBateau: data.typeBateau,
          capacite: data.capacite,
          longueur: data.longueur,
          remarques: data.remarques,
        },
        update: {
          nomBateau: data.nomBateau,
          pavillon: data.pavillon,
          typeBateau: data.typeBateau,
          capacite: data.capacite,
          longueur: data.longueur,
          remarques: data.remarques,
        },
      })

      // Créer le mouvement d'arrivée
      const movement = await tx.movement.create({
        data: {
          bateauId: bateau.id,
          type: 'ARRIVEE',
          arrivalAt: arrivalTime,
          berth: data.berth,
          source: data.source || 'MANUAL',
          notes: data.notes,
          isActive: true,
        },
      })

      return { bateau, movement }
    })

    // Audit log
    await createAuditLog({
      action: 'ARRIVAL',
      entity: 'Movement',
      entityId: result.movement.id,
      changes: { numeroSerie: data.numeroSerie, arrivalAt: arrivalTime },
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    logger.info(
      {
        bateauId: result.bateau.id,
        movementId: result.movement.id,
        numeroSerie: result.bateau.numeroSerie,
      },
      'Arrivée enregistrée'
    )

    return NextResponse.json(
      {
        message: 'Arrivée enregistrée avec succès',
        bateau: result.bateau,
        movement: result.movement,
      },
      { status: 201 }
    )
  } catch (error: any) {
    logger.error({ error }, 'Erreur lors de l\'enregistrement de l\'arrivée')
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}

