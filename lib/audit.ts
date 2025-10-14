import { prisma } from './prisma'
import logger from './logger'

interface AuditLogData {
  action: string
  entity: string
  entityId: string
  changes?: any
  userId?: string
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })

    logger.info({ audit: data }, 'Audit log created')
  } catch (error) {
    logger.error({ error, audit: data }, 'Failed to create audit log')
    // Ne pas faire échouer la requête si l'audit échoue
  }
}

