import "dotenv/config";

/**
 * Prisma configuration.
 *
 * The Prisma CLI reads this file to locate the schema and to know how to run
 * the seed command. We keep the shape deliberately permissive to avoid coupling
 * to internal Prisma types that vary across versions.
 */
export default {
  schema: "prisma/schema.prisma",
  migrate: {
    seed: "tsx prisma/seed.ts",
  },
};
