# Koulun ruokalista — design

**Päivä:** 2026-08-12
**Omistaja:** Juho Lehtola (julehtol / juho@raikee.fi)
**Repo:** `julehtol/koulun-ruokalista` (public)
**Deploy:** Vercel, automaatinen `main`-pushista

## Tarkoitus

Näyttää Pieksämäen koulujen (peruskoulut, lukio, EsEDU Keskuskatu) ruokalista lapsille mobiilissa niin, että he näkevät tänään/huomenna/tällä viikolla/ensi viikolla tarjottavan ruoan yhdellä silmäyksellä. Korvaa PDF-tiedoston, joka on kankea puhelimessa.

## Ei-tavoitteet V1

- Ei kouluvalintaa (vain yksi lista)
- Ei muiden koulujen (Naarajärvi, päiväkodit, EsEDU muut toimipisteet) ruokalistoja
- Ei käyttäjätunnuksia, ei asetuksia
- Ei automaattista PDF-parseria
- Ei kuvia, allergeenitietoja tai ravintosisältöä
- Ei push-notifikaatioita

Kaikki nämä voidaan lisätä myöhemmin ilman rikkovia muutoksia.

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Package manager:** pnpm
- **Styling:** globals.css + CSS modules tai vanilla CSS (ei Tailwindia — kevyempi V1)
- **Hosting:** Vercel
- **Testaus:** vitest yksikkötesteille (`lib/dates.ts`)

## Arkkitehtuuri

Yksi sivu (`app/page.tsx`) joka renderöi client-komponentin `<Ruokalista>`. Komponentti importoi `src/data/menu.json`in staattisesti, laskee "tänään"n Helsingin ajassa, ja renderöi valitun tabin sisällön. Ei serverless-funktioita, ei API-reittejä, ei tietokantaa.

### Miksi client-side?
Palvelinrenderöity "tänään" olisi jumissa siihen hetkeen kun sivu buildattiin, ellei käytettäisi Vercelin ISR:ää tai edge runtimea. Yksinkertaisin tapa saada oikea päivä: laske se selaimessa. Sisältö on staattinen JSON eikä muutu käyttäjän session aikana, joten SEO/latausnopeus eivät kärsi merkittävästi.

## Data-malli

`src/data/menu.json`:

```json
{
  "school": "Peruskoulut, lukio ja EsEDU (Keskuskatu)",
  "source": {
    "pdfUrl": "https://pieksamaentukipalvelut.fi/wp-content/uploads/2026/07/6.-RUOKALISTA-Koulut-27.7.-30.8.2026.pdf",
    "listPageUrl": "https://pieksamaentukipalvelut.fi/ruokalistat/",
    "updatedAt": "2026-08-12"
  },
  "days": [
    { "date": "2026-07-27", "main": "Aurinkoinen broilerkastike", "vegetarian": "Kookos-kasvispata" },
    { "date": "2026-07-28", "main": "Kalakeitto", "vegetarian": "Värikäs linssikeitto" }
  ]
}
```

- `date`: ISO YYYY-MM-DD. Vain arkipäivät (ma–pe) — viikonloput jätetään pois.
- `main`, `vegetarian`: pääruoka ja kasvisvaihtoehto rivinä sellaisenaan PDF:stä. Ei lisukkeita/salaattia V1:ssä.
- `source.updatedAt`: näytetään footerissa "päivitetty X".
- `source.pdfUrl`: linkki alkuperäiseen PDF:ään footerissa.

Skeema määritellään TypeScript-tyyppinä `src/lib/menu.ts`ssä ja validoidaan runtime-tarkistuksella (basic type guard, ei Zodia).

## Näkymät

Yksi sivu, tab-bar ylhäällä: **Tänään · Huomenna · Tällä viikolla · Ensi viikolla**. Default = Tänään.

Tab-tila React `useState`, ei URL:ssa (V1). Jos myöhemmin halutaan jaettavat linkit, siirretään `useSearchParams`iin.

### Tänään
Iso kortti: viikonpäivän nimi + päivämäärä, pääruoka isolla, kasvisvaihtoehto pienemmällä alla.

**Viikonloppulogiikka:** jos tänään on lauantai tai sunnuntai, näytetään seuraavan maanantain menu ja otsikossa lukee "Maanantai 24.8." (ilman erillistä "seuraava kouluruokapäivä" -tekstiä — pidetään yksinkertaisena).

### Huomenna
Sama kortti kuin Tänään, huomiselle. Koska "huomenna" tarkoittaa käytännössä *seuraavaa kouluruokapäivää*, viikonloppu-arvot skipataan:
- Perjantain "huomenna" = seuraava maanantai.
- Lauantain "huomenna" = seuraava maanantai (koska Tänään näyttää jo tulevaa maanantaita, Huomenna on tiistai — täsmennys: Tänään=ma, Huomenna=ti).
- Sunnuntain "huomenna" = tiistai (Tänään=ma, Huomenna=ti).
Toisin sanoen: kun viikonloppu-hyppy on siirtänyt Tänään-näkymän maanantaihin, Huomenna näyttää tiistain — ei toista maanantaita.

### Tällä viikolla
Nykyisen viikon (ma–pe) rivit: viikonpäivä + pvm + pääruoka + kasvis. Nykyinen päivä korostettu keltaisella taustalla. Viikonloppuisin "tällä viikolla" tarkoittaa **alkavaa** viikkoa (eli sitä samaa mikä on "ensi viikolla" perjantaina). Perustelu: viikonloppu on lähempänä alkavaa viikkoa mentaalisti.

### Ensi viikolla
Seuraavan ma–pe viikon rivit. Viikkoraja määritetään ISO-viikkojen mukaan (maanantai on ensimmäinen päivä). Viikonloppuisin "ensi viikolla" tarkoittaa sitä viikkoa, joka alkaa "tällä viikolla" -näkymän jälkeen (eli kahden viikon päästä olevaa maanantaita seuraavaa viikkoa). Toisin sanoen: viikonloput lasketaan aina *päättyvästä* viikosta, ja "tämä viikko" siirtyy jo alkavaan.

### Puuttuvan datan käsittely
Jos pyydetty päivä ei löydy `days`-taulukosta:
- Tänään/Huomenna: `"Valitsemaasi ruokalistaa ei ole vielä saatavilla"` + pieni linkki `listPageUrl`iin.
- Tällä viikolla / Ensi viikolla: jos kaikki 5 päivää puuttuvat → sama viesti. Jos osa löytyy → näytetään olevat, puuttuvat rivinä "Ei tietoa".

## Ulkoasu

- Mobile-first, max-width 640px sisältöalue, keskitetty.
- System font stack (`-apple-system, Segoe UI, sans-serif`).
- Iso typografia: h1 2rem, päivän pääruoka 1.5rem, kasvis 1.125rem.
- Palettu:
  - Tausta: `#fafafa`
  - Teksti: `#1a1a1a`
  - Aksentti (aktiivinen tab, korostus): `#e0b93d` (kaupungin sivun painikkeen keltainen)
  - Vaimeat/apu: `#666`
- Ei kuvia, ei animaatioita.
- Footer: `Lähde: pieksamaentukipalvelut.fi · päivitetty {updatedAt}` + linkki alkuperäiseen PDF:ään.
- Otsikossa: "Koulun ruokalista" + alaotsikko koulu-nimi.

## Aikavyöhyke

Kaikki päivämäärälogiikka Helsingin ajassa. Käytetään `Intl.DateTimeFormat('fi-FI', { timeZone: 'Europe/Helsinki' })` päivämäärän muotoiluun ja rakennetaan "tänään"-päivä joko `new Date()`stä + Helsinki-offsetista tai suoraan `formatToParts`ista. Ei Moment/date-fns V1 — natiivit APIt riittävät.

## Tiedostorakenne

```
koulun-ruokalista/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.mjs
├── .gitignore
├── vitest.config.ts
├── docs/superpowers/specs/2026-08-12-koulun-ruokalista-design.md
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── components/
    │   ├── Ruokalista.tsx      # client component, tab state
    │   ├── TabBar.tsx
    │   ├── DayCard.tsx         # Tänään/Huomenna iso kortti
    │   ├── WeekList.tsx        # 5 rivin lista
    │   └── EmptyState.tsx      # "ei saatavilla" -viesti
    ├── lib/
    │   ├── dates.ts            # Helsinki-aika, viikonloppu-hyppy, ISO-viikko
    │   ├── dates.test.ts
    │   └── menu.ts             # tyypit + JSON-loader
    └── data/
        └── menu.json
```

## `lib/dates.ts` — vastuu

- `todayInHelsinki(): Date` — nykyhetki Helsingin ajassa (Date-objekti jonka Y/M/D vastaa Helsinkiä UTC:ssä).
- `nextSchoolDay(from: Date): Date` — jos `from` on la/su, palauta seuraava maanantai; muuten palauta `from`.
- `nextDay(from: Date): Date` — palauta seuraava kouluruokapäivä (skippaa viikonloput).
- `weekRange(from: Date, offset: 0 | 1): Date[]` — palauta ma–pe (5 päivää) nykyiselle tai seuraavalle viikolle. Viikonloppuisin `offset=0` palauttaa alkavan viikon.
- `formatFiDay(date: Date): string` — "Maanantai 24.8.".

Testataan vitestillä nurkkatapaukset: perjantai, lauantai, sunnuntai, viikonvaihde ma-su, vuodenvaihde.

## Päivitysworkflow (README:hen)

Kun uusi PDF ilmestyy `pieksamaentukipalvelut.fi/ruokalistat/`iin:

1. Kopioi uusi PDF-URL "PERUSKOULUT, LUKIO, ESEDU"-painikkeesta.
2. Avaa tämä repo Claude Codessa.
3. Sano: **"Päivitä ruokalista tästä PDF:stä: `<url>`"**
4. Claude lataa PDF:n, parsii sen, päivittää `src/data/menu.json`in (mukaan lukien `updatedAt` ja `pdfUrl`), committaa ja pushaa.
5. Vercel deployaa automaattisesti.

Ei erillistä CLI-skriptiä — Claude Codella on kaikki tarvittavat työkalut (WebFetch, Read PDF, Edit).

## Vercel-asetukset

- Framework preset: Next.js
- Build command: `pnpm build`
- Install command: `pnpm install`
- Root directory: repo root
- Node versio: 20.x (Vercelin default riittää)
- Ei ympäristömuuttujia V1:ssä

## Rajoitteet ja tunnetut riskit

- **PDF-formaatti voi muuttua.** Skeema on kuitenkin niin yleinen että pientenkin muutosten kohdalla käsin (tai Claudella) päivittäminen onnistuu.
- **URL:n vaihtuminen** on tunnistettu manuaalinen huoltotyö — käyttäjä (Juho) päivittää.
- **Aikavyöhyke:** jos käyttäjä on ulkomailla ja selaimessa on paikallinen aika, sivu näyttää silti Helsingin päivän. Tämä on haluttu käytös.
- **Loma-ajat** (kesä, joulu): PDF ei kata näitä, joten "ei saatavilla" -viesti näkyy. Se on oikein.
