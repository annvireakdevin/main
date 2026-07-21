/**
 * Single source of truth for site content.
 * Components never hard-code copy — everything editable lives here.
 */
export const site = {
  name: "Annvireak Devin",
  role: "Technology Security · Cybersecurity Engineer",
  location: "Phnom Penh, Cambodia",
  company: "Chip Mong Bank",
  email: "annvireakdevin@gmail.com",

  /** The part of the name cast in 3D glass ("Annvireak" stays flat type). */
  hero3DWord: "Devin",

  hero: {
    overline: "Annvireak Devin — Technology Security, Chip Mong Bank",
    // Rendered line by line; `accent: true` lines use the italic serif voice.
    headline: [
      { text: "Security,", accent: false },
      { text: "engineered", accent: true },
      { text: "in silence.", accent: false },
    ],
    lede: "I protect digital systems at the perimeter and build the intelligent platforms that watch over them — on a path toward AI-powered security products.",
    primaryCta: { label: "View Projects", href: "#projects" },
    secondaryCta: { label: "Download Resume", href: "/resume.pdf" },
  },

  socials: [
    // TODO: replace # with real profile URLs
    { index: "01", label: "GitHub", href: "#" },
    { index: "02", label: "LinkedIn", href: "#" },
    { index: "03", label: "Email", href: "mailto:annvireakdevin@gmail.com" },
  ],

  arsenal: {
    index: "02",
    title: "Arsenal",
    headline: [
      { text: "Tools I operate.", accent: false },
      { text: "Systems I built.", accent: true },
    ],
    items: [
      // ---- Tools ----
      { name: "IBM QRadar", kind: "Tool", meta: "SIEM · daily driver", art: "type", artText: "qradar", span: 7, href: "#" },
      { name: "Splunk", kind: "Tool", meta: "SIEM · analytics", art: "ticks", artText: "", span: 5, href: "#" },
      { name: "Cloudflare", kind: "Tool", meta: "edge security", art: "ring", artText: "", span: 4, href: "#" },
      { name: "Docker", kind: "Tool", meta: "containers", art: "grid", artText: "", span: 4, href: "#" },
      { name: "Python", kind: "Tool", meta: "automation", art: "wave", artText: "", span: 4, href: "#" },
      // ---- Projects ----
      { name: "SOC Reporting Platform", kind: "Project", meta: "2025 · in production", art: "type", artText: "soc·rpt", span: 8, href: "#" },
      { name: "Vulnerability Dashboard", kind: "Project", meta: "2025", art: "ticks", artText: "", span: 4, href: "#" },
      { name: "Threat Intelligence Platform", kind: "Project", meta: "2024", art: "grid", artText: "", span: 5, href: "#" },
      { name: "QRadar DSM Parser", kind: "Project", meta: "2024", art: "wave", artText: "", span: 7, href: "#" },
      { name: "AI Security Assistant", kind: "Project", meta: "2026 · in design", art: "type", artText: "ai·sec", span: 12, href: "#" },
    ],
  },

  sectionCount: 9,
} as const;

export type ArsenalItem = (typeof site.arsenal.items)[number];
