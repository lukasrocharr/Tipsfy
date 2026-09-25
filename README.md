# Tipsfy

Aplicação Next.js com App Router, TypeScript estrito e Tailwind CSS v4.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

A base visual foi migrada do protótipo Vite e continua usando os mocks em `src/interfaces/web/data.ts`.

### Tailwind v4 no Next.js

O tema original foi preservado em `src/interfaces/web/globals.css`, incluindo `@import 'tailwindcss'`. No Vite, o Tailwind era registrado pelo plugin `@tailwindcss/vite`; no Next.js, a integração é feita pelo pipeline PostCSS padrão do framework. Nenhum redesenho visual foi feito nesta etapa.
