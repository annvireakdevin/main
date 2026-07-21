/**
 * Seeds the single admin user (from ADMIN_EMAIL / ADMIN_PASSWORD) and
 * imports the original static arsenal as draft-free starter content.
 * Run: npm run db:seed
 */
import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

// Sign-up is enabled ONLY in this offline script; the app disables it.
const seedAuth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});

const STARTER = [
  { title: "IBM QRadar", meta: "SIEM · daily driver", category: "TOOL", gridSize: "WIDE", artVariant: "TYPE", artText: "qradar" },
  { title: "Splunk", meta: "SIEM · analytics", category: "TOOL", gridSize: "MEDIUM", artVariant: "TICKS" },
  { title: "Cloudflare", meta: "edge security", category: "TOOL", gridSize: "SMALL", artVariant: "RING" },
  { title: "Docker", meta: "containers", category: "TOOL", gridSize: "SMALL", artVariant: "GRID" },
  { title: "Python", meta: "automation", category: "TOOL", gridSize: "SMALL", artVariant: "WAVE" },
  { title: "SOC Reporting Platform", meta: "2025 · in production", category: "PROJECT", gridSize: "WIDE", artVariant: "TYPE", artText: "soc·rpt" },
  { title: "Vulnerability Dashboard", meta: "2025", category: "PROJECT", gridSize: "SMALL", artVariant: "TICKS" },
  { title: "Threat Intelligence Platform", meta: "2024", category: "PROJECT", gridSize: "MEDIUM", artVariant: "GRID" },
  { title: "QRadar DSM Parser", meta: "2024", category: "PROJECT", gridSize: "WIDE", artVariant: "WAVE" },
  { title: "AI Security Assistant", meta: "2026 · in design", category: "PROJECT", gridSize: "HERO", artVariant: "TYPE", artText: "ai·sec" },
] as const;

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ admin user already exists (${email})`);
  } else {
    await seedAuth.api.signUpEmail({
      body: { email, password, name: "Annvireak Devin" },
    });
    console.log(`✓ admin user created (${email})`);
  }

  let position = 0;
  for (const item of STARTER) {
    const slug = slugify(item.title);
    await db.project.upsert({
      where: { slug },
      update: {},
      create: {
        title: item.title,
        slug,
        meta: item.meta,
        category: item.category,
        status: "PUBLISHED",
        gridSize: item.gridSize,
        artVariant: item.artVariant,
        artText: "artText" in item ? item.artText : null,
        position: position++,
      },
    });
  }
  console.log(`✓ ${STARTER.length} starter projects upserted`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
