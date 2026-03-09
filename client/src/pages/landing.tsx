import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Target,
    title: "AI Skill Gap Analysis",
    description:
      "Compare your current profile with target roles and instantly see what to learn next.",
  },
  {
    icon: Workflow,
    title: "Personalized Roadmaps",
    description:
      "Get practical, step-by-step learning plans with clear milestones and priorities.",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description:
      "Track growth over time and adjust your plan based on changing goals and market demand.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Workspace",
    description:
      "Manage assessments, recommendations, and planning data in one protected dashboard.",
  },
];

const steps = [
  {
    title: "Complete your profile",
    description: "Share your interests, strengths, and goals through a guided assessment.",
  },
  {
    title: "Receive career matches",
    description: "AI recommends roles with demand, salary range, and fit insights.",
  },
  {
    title: "Execute your roadmap",
    description: "Follow a weekly action plan and keep improving with measurable progress.",
  },
];

const testimonials = [
  {
    quote:
      "We reduced onboarding time for early-career hires by 32% with role-based learning plans.",
    name: "Priya Nair",
    role: "Talent Lead, Orbit Labs",
  },
  {
    quote:
      "This gave our team one source of truth for career development and upskilling priorities.",
    name: "Michael Chen",
    role: "Engineering Manager, NorthGrid",
  },
  {
    quote:
      "I went from confusion to a clear transition path in one week. The roadmap was actionable.",
    name: "Avery Brooks",
    role: "Career Switcher",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    cta: "Start Free",
    highlight: false,
    items: ["Basic assessment", "3 career matches", "1 active roadmap"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    cta: "Get Started Free",
    highlight: true,
    items: ["Unlimited assessments", "Unlimited matches", "Priority AI generation"],
  },
  {
    name: "Team",
    price: "$79",
    period: "/month",
    cta: "Contact Sales",
    highlight: false,
    items: ["Up to 10 members", "Shared planning workspace", "Advanced usage insights"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.15),transparent_35%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.18),transparent_40%)]" />

      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/25">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">Productivity Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 md:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-4 w-4" />
              Career Intelligence Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Build a faster path from skills to outcomes.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Productivity Hub helps individuals and teams assess strengths, discover the right
              opportunities, and execute clear learning roadmaps with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 px-7" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-7" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xl shadow-black/5"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="font-semibold">Weekly Momentum</p>
              <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600">
                +18%
              </span>
            </div>
            <div className="space-y-3">
              {["Assessment completed", "Role match generated", "Roadmap updated"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
                >
                  <span className="text-sm font-medium">{item}</span>
                  <Check className="h-4 w-4 text-primary" />
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Features</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Built for practical career growth, not generic advice.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl border bg-card p-6">
                <feature.icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-3xl font-bold md:text-4xl">How It Works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold text-primary">Step {i + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Trusted by Growing Teams</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure key={item.name} className="rounded-2xl border bg-card p-6">
                <blockquote className="text-sm leading-6 text-muted-foreground">{item.quote}</blockquote>
                <figcaption className="mt-5">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-24" id="pricing">
          <h2 className="text-center text-3xl font-bold md:text-4xl">Pricing</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Start free and upgrade when you need deeper automation.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border bg-card p-6 ${
                  plan.highlight ? "border-primary shadow-xl shadow-primary/10" : ""
                }`}
              >
                <p className="font-semibold">{plan.name}</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-2">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={plan.highlight ? "default" : "outline"} asChild>
                  <Link href={plan.name === "Team" ? "/login" : "/signup"}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-card/40">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-6 py-8 text-sm text-muted-foreground md:grid-cols-2">
          <p>(c) {new Date().getFullYear()} Productivity Hub. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5 md:justify-end">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign up</Link>
            <a href="#pricing">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
