# Koulun ruokalista

Pieni sovellus, joka näyttää Pieksämäen peruskoulujen, lukion ja EsEDU:n ruokalistan mobile-ystävällisesti.

Alkuperäinen lähde: [pieksamaentukipalvelut.fi/ruokalistat](https://pieksamaentukipalvelut.fi/ruokalistat/)

## Kehitys

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # vitest
pnpm build      # tuotantobuild
```

## Miten päivitän ruokalistan?

Kun uusi PDF ilmestyy `pieksamaentukipalvelut.fi/ruokalistat/`iin:

1. Kopioi uusi PDF-URL sivun **"PERUSKOULUT, LUKIO, ESEDU (KESKUSKATU)"** -painikkeesta.
2. Avaa tämä repo Claude Codessa.
3. Sano: **"Päivitä ruokalista tästä PDF:stä: `<url>`"**
4. Claude lataa PDF:n, parsii sen, päivittää `src/data/menu.json`in (mukaan lukien `updatedAt` ja `pdfUrl`), committaa ja pushaa.
5. Vercel deployaa automaattisesti `main`-pushista.

Jos haluat päivittää manuaalisesti, muokkaa suoraan `src/data/menu.json`ia:

- `days`-taulukkoon vain arkipäivät (ma–pe), muodossa `{ "date": "YYYY-MM-DD", "main": "…", "vegetarian": "…" }`.
- Jos päivällä ei ole erillistä kasvisruokaa, käytä samaa tekstiä molempiin.
- Päivitä `source.pdfUrl` ja `source.updatedAt`.

## Stack

- Next.js 15 (App Router) + TypeScript + React 19
- pnpm, vitest, vanilla CSS
- Hosting: Vercel (`main`-branch auto-deploy)

## Suunnitteludokumentit

- Spec: [`docs/superpowers/specs/2026-08-12-koulun-ruokalista-design.md`](docs/superpowers/specs/2026-08-12-koulun-ruokalista-design.md)
- Toteutusplaani: [`docs/superpowers/plans/2026-08-12-koulun-ruokalista.md`](docs/superpowers/plans/2026-08-12-koulun-ruokalista.md)
