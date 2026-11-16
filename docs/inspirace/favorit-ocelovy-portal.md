# Ocelový svařovaný portál

Rozbor stroje z komunitní fotografie: svařovaný ocelový portál s vodou chlazeným vřetenem. Při rešerši šlo o hlavního kandidáta na finální koncept.

Zdroj: obrázek z komunity (video, text „vrátit a objednat si“), autor neznámý.

> **Aktuální stav (15. 11. 2026):** Z tohoto vzoru [návrh Custom1](../navrh/nas-navrh.md) převzal svařený portál z jeklů (25×25), pohon řemenem a rozdělení stavby na etapy. Místo HGR20 je na obou osách SBR20, místo vodou chlazeného vřetena je objednáno vzduchem chlazené HLTNC 2,2 kW ER20.

## Rozbor fotografie

| Část | Řešení na fotografii | Přínos |
|---|---|---|
| Rám a portál | **svařované ocelové jekly** (červeně natřené, odhadem 80×80 až 100×50 mm), portál na ocelových nohách | Ocel je cca 3× tužší než hliník stejného průřezu a je levná. Na velké délky (1,4 × 2 m) je to nejlevnější cesta k tuhosti. |
| Vedení X (portál) | **profilové lineární vedení** (typ HGR/HIWIN, odhad 20 mm), dvě kolejnice nad sebou na čele portálu | Dvě kolejnice nad sebou drží osu Z proti klopení. |
| Pohon X | **ozubený řemen napnutý staticky podél portálu** (oba konce upnuté napínáky, na vozíku pastorek s kladkami, tzv. pohon omega) | Levné, rychlé, bez kmitání šroubu na dlouhé délce. Na dřevo dostačující. |
| Osa Z | hliníková deska, **2 kolejnice + svislý kuličkový šroub**, motor nahoře, zdvih odhadem 200–250 mm | Krátký šroub je přesný a samosvorný (vřeteno nespadne). |
| Vřeteno | **vodou chlazené**, odhad 80 mm / 2,2 kW (modré hadičky), v plastovém nebo hliníkovém držáku | Tiché, s dlouhou životností, výkon i na tvrdé dřevo. |
| Odsávání | **odsávací hubice s kartáčem** pod vřetenem + spirálová hadice shora | Nutné, na velkých deskách vzniká hodně třísek. |
| Osa Y | spodní **černé ocelové nosníky**, energetický řetěz podél, pohon pravděpodobně také řemen nebo hřeben | Velká délka bez šroubu. |
| Stůl | dřevotříska nebo MDF jako obětní deska (spoil board), obrobek upnutý latěmi | Jednoduché, levné, lze přefrézovat do roviny. |
| Kabeláž | energetické řetězy na X i Y, uzemněné kabely | Bez nich se kabely časem prodřou. |
| Ostatní | malý modrý displej na ose Z (pravděpodobně teploměr nebo kontrolka chladicí vody) | Hlídání teploty vody je u vodou chlazeného vřetena užitečné. |

Na fotografii se frézuje **velká deska river table (dřevo + epoxid)**, tedy srovnávání povrchu velkou frézou. Pro tuto úlohu je koncepce určena.

## Shoda s požadavky

- ✅ Velikost odpovídá náčrtu (cca 1400 × 2000 mm).
- ✅ Motorizace po etapách: osu Z s kuličkovým šroubem lze motorizovat hned. Osy X a Y jsou na řemenu nebo hřebenu, motory se přidají později bez přestavby (stačí ponechat místo na držáky motorů a pastorky).
- ✅ Vodou chlazené vřeteno s měničem lze ovládat přes RS485 (Modbus) z FluidNC na ESP32.
- ⚠️ Na hliník je řemen hraniční, protože pruží. Na občasné tenké hliníkové plechy stačí. Pro náročnější obrábění hliníku by na X a Y byl lepší **hřeben s pastorkem** (helikální) nebo převod 1:3 až 1:5 na řemen.
- ⚠️ Svařovaný rám se po svaření zkroutí. Plochy pod kolejnice je nutné vyrovnat: podložkami s měřením, zalitím epoxidem (epoxy leveling) nebo přišroubovanými frézovanými hliníkovými pásy.
- ⚠️ Vyžaduje svářečku a více práce s rámem. Vodou chlazené vřeteno potřebuje čerpadlo, nádrž a hlídání průtoku.

## Převzaté prvky pro finální návrh

1. Ocelový svařovaný rám a portál z jeklů.
2. Profilové vedení HGR20 (případně SBR20 na ose Y kvůli ceně, viz [katalog vedení](../dily/vedeni/kandidati.md)).
3. Osa Z: kuličkový šroub SFU1605 + 2 kolejnice, zdvih 150–250 mm.
4. Osy X a Y: řemen (omega) nebo hřeben s pastorkem, osa Y se dvěma motory (na každé straně jeden).
5. Vodou chlazené vřeteno 2,2 kW + měnič s RS485.
6. Odsávací hubice s kartáčem, energetické řetězy, obětní deska z MDF.
