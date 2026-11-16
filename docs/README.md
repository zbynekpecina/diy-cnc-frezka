# DIY CNC frézka

Dokumentace stavby levné portálové CNC frézky na dřevo. Obsahuje návrh stroje, rozhodnutí, inspiraci z komunity a rešerše dílů.

## Stav projektu

| Oblast | Stav |
|---|---|
| Fáze | mechanika – nákup dílů, pohony až v druhé fázi |
| Objednáno | vřeteno 2,2 kW s měničem EV210, vedení SBR20 1 800 mm |
| Koupeno | srovnávací fréza Ø39 |
| Otevřené | rozměr plexiskla vozíku X, uchycení kolejnic Y na profil 40×40 |

## Kde co najít

| Stránka | Obsah |
|---|---|
| [Custom](navrh/nas-navrh.md) | aktuální návrh stroje, kontroly rozměrů, co chybí |
| [Rozhodnutí](navrh/rozhodnuti.md) | přehled rozhodnutí a jejich důvody |
| [Koncept v2](navrh/koncept-v2.md) | první koncept velkého stroje a otevřené otázky |
| [Prototyp v1](navrh/prototyp-v1.md) | původní ruční prototyp a proč nejezdí rovně |
| [Ocelový portál](inspirace/favorit-ocelovy-portal.md) | rozbor stroje, který nás inspiroval |
| [Komunitní projekty](inspirace/komunitni-projekty.md) | PrintNC, LowRider, Root CNC, IndyMill a další |

Rešerše dílů jsou v sekci **Díly a technologie**. Konkrétní nabídky s cenami a fotkami jsou v záložce **Produkty**.

## Struktura složky docs

| Složka | Obsah |
|---|---|
| `navrh/` | návrh stroje, rozhodnutí, historie |
| `inspirace/` | cizí stavby a jejich rozbor |
| `dily/<kategorie>/katalog.md` | rešerše dané kategorie |
| `dily/<kategorie>/kandidati.md` | konkrétní nabídky (zdroj záložky Produkty) |
| `dily/<kategorie>/obrazky/` | náhledy produktů |

## Jak přidat produkt

Každý produkt je v souboru `kandidati.md` jedna sekce `## Název`. Web z ní čte:

- `- Odkaz: https://…` – odkaz do obchodu,
- řádek s `Cena` a částkou `**1 234 Kč**`, doprava `doprava 99 Kč` nebo `doprava zdarma`,
- `- Obrázky: [obrazky/slozka/](obrazky/slozka/)` – složka s obrázky,
- `**Předběžný verdikt:** …` – hodnocení (✅ = kandidát, „nekupovat“, „záloha“ apod.).

Po úpravě dokumentace se web sestaví příkazem `python tools/build.py`.
