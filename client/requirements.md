## Packages
framer-motion | Smooth entry animations and micro-interactions
recharts | Beautiful data visualization for gap analysis (radar/bar charts)
lucide-react | High-quality icons for UI

## Notes
- Tailwind config should include `font-sans: ["Plus Jakarta Sans", "sans-serif"]` for display/headings and `font-body: ["Inter", "sans-serif"]` for general text.
- Protected routes assume `/api/me` returns `401` when the user is not authenticated.
- The sidebar layout uses Shadcn UI's Sidebar Provider.
