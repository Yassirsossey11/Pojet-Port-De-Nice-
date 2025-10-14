import { z } from 'zod'

// Validation pour créer/mettre à jour un bateau
export const BateauSchema = z.object({
  numeroSerie: z
    .string()
    .min(1, 'Le numéro de série est requis')
    .max(50, 'Le numéro de série est trop long')
    .regex(/^[A-Z0-9-]+$/, 'Le numéro de série doit contenir uniquement des lettres majuscules, chiffres et tirets')
    .transform(val => val.toUpperCase()),
  nomBateau: z
    .string()
    .min(1, 'Le nom du bateau est requis')
    .max(100, 'Le nom du bateau est trop long'),
  pavillon: z
    .string()
    .max(50, 'Le pavillon est trop long')
    .optional(),
  typeBateau: z
    .string()
    .max(50, 'Le type de bateau est trop long')
    .optional(),
  capacite: z
    .number()
    .int('La capacité doit être un nombre entier')
    .positive('La capacité doit être positive')
    .max(10000, 'La capacité semble incorrecte')
    .optional()
    .nullable(),
  longueur: z
    .number()
    .positive('La longueur doit être positive')
    .max(500, 'La longueur semble incorrecte')
    .optional()
    .nullable(),
  remarques: z
    .string()
    .max(1000, 'Les remarques sont trop longues')
    .optional()
    .nullable(),
})

// Validation pour enregistrer une arrivée
export const ArriveeSchema = z.object({
  numeroSerie: z
    .string()
    .min(1, 'Le numéro de série est requis')
    .transform(val => val.toUpperCase()),
  nomBateau: z
    .string()
    .min(1, 'Le nom du bateau est requis')
    .max(100),
  pavillon: z.string().optional().nullable(),
  typeBateau: z.string().optional().nullable(),
  capacite: z.number().int().positive().optional().nullable(),
  longueur: z.number().positive().optional().nullable(),
  berth: z
    .string()
    .max(20, 'Le numéro de poste est trop long')
    .optional()
    .nullable(),
  source: z.enum(['MANUAL', 'API', 'SCAN', 'IMPORT']).default('MANUAL').transform(val => val as string),
  notes: z.string().max(1000).optional().nullable(),
  remarques: z.string().max(1000).optional().nullable(),
})

// Validation pour enregistrer un départ
export const DepartSchema = z.object({
  numeroSerie: z
    .string()
    .min(1, 'Le numéro de série est requis')
    .transform(val => val.toUpperCase()),
  notes: z.string().max(1000).optional().nullable(),
})

// Validation pour la recherche
export const SearchSchema = z.object({
  query: z.string().min(1, 'Le terme de recherche est requis').max(100),
})

// Validation pour les filtres de journal
export const JournalFiltersSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  query: z.string().optional(),
  berth: z.string().optional(),
  source: z.enum(['MANUAL', 'API', 'SCAN', 'IMPORT']).optional(),
  type: z.enum(['ARRIVEE', 'DEPART']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Types inférés
export type BateauInput = z.infer<typeof BateauSchema>
export type ArriveeInput = z.infer<typeof ArriveeSchema>
export type DepartInput = z.infer<typeof DepartSchema>
export type SearchInput = z.infer<typeof SearchSchema>
export type JournalFiltersInput = z.infer<typeof JournalFiltersSchema>
