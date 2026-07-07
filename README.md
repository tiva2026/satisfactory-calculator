# Satisfactory Production Calculator

A mobile-first production chain calculator for [Satisfactory](https://www.satisfactorygame.com/), built with Next.js 15 and TypeScript. Plan your factory efficiently by calculating the full production tree for any item in the game.

Live site: [https://satis.cc](https://satis.cc)

The calculator is now live and ready to use in production.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwind-css)

## Features

- **Full Production Tree Calculation** — Recursively resolves all intermediate ingredients and raw resources needed for any target item and quantity
- **Official Game Data** — Recipes and item names sourced directly from the Satisfactory game files (`en-US.json`), ensuring accuracy with official terminology
- **Mobile-First UI** — Responsive design optimized for phone and tablet use on the factory floor
- **Item Search** — Quickly find any craftable item by name with live search filtering
- **Custom Quantity** — Set any target output rate (items/min) and get the full scaled production plan
- **Production Nodes** — Visualize the complete dependency tree: which machines are needed, at what clock speed, and what raw resources are consumed
- **SEO-Friendly** — Static page generation for every item, with proper metadata for search engines
- **Sitemap** — Auto-generated sitemap for all item pages

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Game Data | Official Satisfactory `en-US.json` |
| Testing | Jest + Testing Library |

## Getting Started

### Prerequisites

- Node.js 18 or higher
- The official Satisfactory `en-US.json` data file (extracted from game files or the [Satisfactory Wiki](https://satisfactory.wiki.gg/))

### Installation

```bash
# Clone the repository
git clone https://github.com/tiva2026/satisfactory-calculator.git
cd satisfactory-calculator

# Install dependencies
npm install

# Place your en-US.json in the project root
# (extracted from Satisfactory game files)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Live Deployment

The production deployment is available at [https://satis.cc](https://satis.cc).
`www.satis.cc` redirects to the apex domain.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx                    # Root layout with global metadata
│   ├── page.tsx                      # Root redirect to /calc
│   ├── sitemap.ts                    # Auto-generated sitemap
│   └── calc/
│       ├── page.tsx                  # /calc redirect to default item
│       └── [itemSlug]/
│           ├── page.tsx              # Server component — loads game data
│           └── calculator-client.tsx # Client component — interactive UI
├── src/
│   ├── data/
│   │   └── real-recipes.ts          # Parsed recipe definitions
│   ├── lib/
│   │   └── production-calculator.ts # Core calculation algorithm
│   └── utils/
│       └── slugify.ts               # URL slug generation
├── scripts/
│   └── extract-recipes.js           # Script to extract recipes from game data
├── en-US.json                        # Official Satisfactory game data (not committed)
└── zh-Hans.json                      # Simplified Chinese translations (optional)
```

## How It Works

1. **Data Loading** — The server component reads `en-US.json` at build time, flattening all native classes into a searchable item list.
2. **Recipe Parsing** — `parseRecipe()` converts raw game recipe strings (e.g. `(ItemClass=...,Amount=...)`) into structured input/output objects.
3. **Tree Calculation** — `calculateFullProductionTree()` performs a recursive depth-first traversal of the recipe graph, accumulating machine counts and raw resource requirements.
4. **Rendering** — The client component displays the result as a collapsible production tree, showing each production step with machine type, count, and I/O rates.

## Game Terminology

All item names, recipe names, and machine names use official Satisfactory English terminology from the game's localization files:

- **Miner** — extracts raw ore nodes
- **Smelter** — converts ore to ingots
- **Constructor** — single-ingredient recipes
- **Assembler** — two-ingredient recipes
- **Manufacturer** — three/four-ingredient recipes
- **Refinery** — fluid-based recipes
- **Blender** — complex fluid + solid recipes
- **Particle Accelerator** — late-game high-power recipes

## Scripts

```bash
# Extract and update recipe data from en-US.json
node scripts/extract-recipes.js

# Fix JSON encoding issues in game data files
node fix-json-encoding.js

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## Disclaimer

This project is a fan-made tool and is not affiliated with or endorsed by Coffee Stain Studios. Satisfactory is a trademark of Coffee Stain Studios AB. Game data is sourced from publicly available game files for non-commercial use.

## License

MIT
