-- Preserve durable audit history for every advertisement mutation performed by an admin.
ALTER TYPE "ModerationAction" ADD VALUE 'ADVERTISEMENT_CREATION';
ALTER TYPE "ModerationAction" ADD VALUE 'ADVERTISEMENT_STATUS';
ALTER TYPE "ModerationAction" ADD VALUE 'ADVERTISEMENT_DELETION';
