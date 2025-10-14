import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Nettoyer les données existantes
  await prisma.movement.deleteMany()
  await prisma.bateau.deleteMany()
  await prisma.auditLog.deleteMany()

  // Créer des bateaux avec des mouvements
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Bateau 1: Actuellement à quai
  const bateau1 = await prisma.bateau.create({
    data: {
      numeroSerie: 'FR-YACHT-001',
      nomBateau: 'La Méditerranée',
      pavillon: 'France',
      typeBateau: 'Yacht de luxe',
      capacite: 50,
      longueur: 45.5,
      remarques: 'Yacht privé VIP',
      mouvements: {
        create: {
          type: 'ARRIVEE',
          arrivalAt: yesterday,
          berth: 'A12',
          source: 'MANUAL',
          notes: 'Arrivée prévue pour maintenance',
          isActive: true,
        },
      },
    },
  })

  // Bateau 2: Actuellement à quai
  const bateau2 = await prisma.bateau.create({
    data: {
      numeroSerie: 'IT-FERRY-500',
      nomBateau: 'Corsica Express',
      pavillon: 'Italie',
      typeBateau: 'Ferry',
      capacite: 1200,
      longueur: 150.0,
      remarques: 'Ferry régulier Nice-Corse',
      mouvements: {
        create: {
          type: 'ARRIVEE',
          arrivalAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // Il y a 6 heures
          berth: 'B5',
          source: 'MANUAL',
          notes: 'Rotation régulière',
          isActive: true,
        },
      },
    },
  })

  // Bateau 3: Actuellement à quai
  const bateau3 = await prisma.bateau.create({
    data: {
      numeroSerie: 'MC-LUXURY-777',
      nomBateau: 'Monaco Dream',
      pavillon: 'Monaco',
      typeBateau: 'Superyacht',
      capacite: 24,
      longueur: 88.5,
      remarques: 'Propriétaire célèbre',
      mouvements: {
        create: {
          type: 'ARRIVEE',
          arrivalAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Il y a 2 heures
          berth: 'A1',
          source: 'MANUAL',
          notes: 'Séjour de 3 jours prévu',
          isActive: true,
        },
      },
    },
  })

  // Bateau 4: Parti (mouvement terminé)
  const bateau4 = await prisma.bateau.create({
    data: {
      numeroSerie: 'ES-CARGO-200',
      nomBateau: 'Barcelona Star',
      pavillon: 'Espagne',
      typeBateau: 'Cargo',
      capacite: 8,
      longueur: 65.0,
      remarques: 'Transport de marchandises',
      mouvements: {
        create: {
          type: 'ARRIVEE',
          arrivalAt: twoDaysAgo,
          departureAt: yesterday,
          berth: 'C10',
          source: 'MANUAL',
          notes: 'Chargement/déchargement effectué',
          isActive: false,
        },
      },
    },
  })

  // Bateau 5: Avec historique de plusieurs mouvements
  const bateau5 = await prisma.bateau.create({
    data: {
      numeroSerie: 'FR-CRUISE-999',
      nomBateau: 'Azur Princess',
      pavillon: 'France',
      typeBateau: 'Paquebot de croisière',
      capacite: 3000,
      longueur: 320.0,
      remarques: 'Croisières Méditerranée',
      mouvements: {
        createMany: {
          data: [
            // Mouvement ancien (terminé)
            {
              type: 'ARRIVEE',
              arrivalAt: lastWeek,
              departureAt: new Date(lastWeek.getTime() + 10 * 60 * 60 * 1000),
              berth: 'D1',
              source: 'MANUAL',
              notes: 'Escale technique',
              isActive: false,
            },
            // Mouvement récent (terminé)
            {
              type: 'ARRIVEE',
              arrivalAt: twoDaysAgo,
              departureAt: yesterday,
              berth: 'D1',
              source: 'MANUAL',
              notes: 'Embarquement passagers',
              isActive: false,
            },
          ],
        },
      },
    },
  })

  // Bateau 6: Actuellement à quai (arrivé récemment)
  const bateau6 = await prisma.bateau.create({
    data: {
      numeroSerie: 'UK-SAIL-123',
      nomBateau: 'British Wind',
      pavillon: 'Royaume-Uni',
      typeBateau: 'Voilier',
      capacite: 12,
      longueur: 28.0,
      remarques: 'Tour du monde',
      mouvements: {
        create: {
          type: 'ARRIVEE',
          arrivalAt: new Date(now.getTime() - 30 * 60 * 1000), // Il y a 30 minutes
          berth: 'A8',
          source: 'MANUAL',
          notes: 'Ravitaillement prévu',
          isActive: true,
        },
      },
    },
  })

  // Bateau 7: Parti récemment
  const bateau7 = await prisma.bateau.create({
    data: {
      numeroSerie: 'GR-YACHT-456',
      nomBateau: 'Aegean Pearl',
      pavillon: 'Grèce',
      typeBateau: 'Yacht',
      capacite: 16,
      longueur: 35.0,
      mouvements: {
        create: {
          type: 'ARRIVEE',
          arrivalAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          departureAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Il y a 1 heure
          berth: 'A15',
          source: 'MANUAL',
          notes: 'Réparations terminées',
          isActive: false,
        },
      },
    },
  })

  console.log('✅ Seeding terminé avec succès!')
  console.log(`📊 Créé:`)
  console.log(`   - 7 bateaux`)
  console.log(`   - 9 mouvements`)
  console.log(`   - 4 bateaux actuellement à quai`)
  console.log(`   - 3 bateaux partis`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

