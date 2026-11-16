# Custom

Portálová frézka ze svařených jeklů 25×25 postavená na stávajícím stole. Cílem je co nejlevnější stroj na srovnávání a frézování dřeva. Parametrický 3D model s kótami, kontrolami a kusovníkem je v záložce **3D model**.

| Parametr | Hodnota |
|---|---|
| Pracovní plocha | cca 1 550 × 680 mm |
| Zdvih Z | 200 mm |
| Vedení | SBR20 na osách X i Y |
| Vřeteno | 2,2 kW, ER20, 24 000 ot/min, chlazení vzduchem |
| Řízení | FluidNC (ESP32), krokové motory NEMA23 |
| Materiál | dřevo, plasty |

## Konstrukce

### Stůl a spodní konstrukce

- Spodní konstrukce z hliníkových solárních profilů 40×40 s deskou 1 800 × 750 mm už existuje. Leží volně na dřevěném stole.
- Boční profily 1 800 mm nesou vedení Y a leží nad podélnými spodními profily.
- Výška a rovinnost se nastavují v rozích závitovými tyčemi Ø25. Tyč vede z odřezku jeklu vedle spodního profilu do jeklu 100 mm na boku bočního profilu. Mezi profily je rozpěrka z odřezku profilu, nahoře matice.

### Osa Y

- Kolejnice SBR20 2× 1 800 mm (VEVOR) se čtyřmi vozíky SBR20UU, objednáno 15. 11. 2026.
- Na každé straně dva vozíky s roztečí 200 mm. Spojuje je pásovina 50×6 a jekl 25×25.
- Na zadní vozík je přivařená stojka z jeklu 25×25 (výchozí délka 285 mm). Vzpěra vede od předního vozíku na stejné straně jako vřeteno, takže portál dojede dál na oba konce.

> **Pozor:** Podpěra kolejnice je široká 45 mm a díry má 15 mm od osy. Na profilu 40×40 padnou mimo středovou drážku. Kolejnici je potřeba uchytit nýtovacími maticemi M5 do stěny profilu, nebo přes pásovinu přichycenou do drážky.

### Portál a osa X

- Dva příčníky z jeklu 25×25 jsou přivařené mezi stojky a tvoří jeden rám. Rozteč příčníků je 150 mm, délka 765 mm.
- Pod kolejnicemi je pásovina 50×6, protože díry podpěry SBR20 jsou mimo jekl 25×25.
- Kolejnice SBR20 2× 1 000 mm (SucceBuy) se čtyřmi vozíky SBR20UU, přesah přes rám cca 85 mm na každé straně.

### Vozík X a osa Z

- Čtyři vozíky osy X spojuje deska z plexiskla 300 × 200 × 10 mm s otvory na rozteč vozíků 35 × 35 mm (šrouby M6).
- Na desce je hotový modul osy Z se zdvihem 200 mm: dvě vodicí tyče, kuličkový šroub Ø16 a ruční kolo s aretací. Motor NEMA23 se doplní později.
- Vřeteno je na vozíku modulu přes adaptér z hliníkové desky 10 mm (120 × 175 mm). Díry patky vřetena (95 mm od sebe) jsou širší než vozík modulu (80 mm).

> **Otevřené:** Okraj plexiskla nad a pod vozíkem vychází jen 1 mm. Řešení: plexisklo 300 × 220 mm, nebo rozteč příčníků 135 mm (okraj 8,5 mm). Rozhodnout před objednáním plexiskla a svařením portálu.

### Vřeteno a měnič

- HLTNC 2,2 kW GDZ80x73 ER20, 24 000 ot/min, chlazení vzduchem, s měničem EV210 (1F 230 V, RS485). Objednáno 15. 11. 2026 za 4 053 Kč.
- Kleštiny ani klíč ER20 nejsou v sadě. Dokoupit kleštinu 8 mm (srovnávací fréza Ø39 už je koupená) a klíč ER20A.

## Varianta Custom2

Obavou u varianty Custom je opora kolejnic: podpěra SBR20 je široká 45 mm, boční profil jen 40 mm. Custom2 proto mění spodní část:

- boční profily se rozeberou a přišroubují **vedle podélných spodních profilů** ve stejné rovině,
- kolejnice leží na dvojici profilů o šířce **80 mm** (osa kolejnice na spáře profilů),
- odpadají závitové tyče a rozpěrky v rozích, vedení je o 90 mm níž,
- stojky portálu se prodlouží na 370 mm, aby fréza dál dojela na desku,
- rozteč kolejnic Y je 830 mm, šířka frézování vychází 719 mm.

Na spodní konstrukci zůstává podkladová deska, na kterou se klade obrobek. Obě varianty jsou v 3D modelu a mají vlastní výrobní výkresy.

## Pohony a elektronika

Stroj se staví nejdřív bez motorů. Motorizace přijde ve druhé fázi.

| Část | Řešení |
|---|---|
| Motory | 4× NEMA23 s drivery DM556 (X, Y1, Y2, Z), zdroj 36 V |
| Pohon X a Y | řemen GT2 10 mm s omega pohonem na vozíku, napínání šroubem M6 |
| Osa Y | dva motory, na každé straně jeden. Pohon jen na jedné straně by portál kroutil. |
| Řízení | FluidNC na klasickém ESP32 (FluidNC na ESP32-P4 neběží) |
| Displej | 7" ESP32-P4 s RS485, Modbus master k měniči, vlastní firmware |
| Vřeteno | otáčky 0–10 V z PWM přes převodník, start relé na X1, chyba TA/TC přes optočlen |
| Odsávání | výstup M8 → relé → stykač zásuvky vysavače |
| Čidla | mechanické koncové spínače NC (home X a Y na minimu), indukční M12 nahoře na ose Z |

Rozvaděč je zavěšený pod deskou stolu na dvou pásovinách, dvířka ven. Vysavač stojí pod stolem. Displej je na obráceném L z jeklu 25×25, který navazuje na rohový jekl motoru Y1. Držák hadice vysavače je uprostřed horního příčníku.

Podrobné zapojení je v záložce **Zapojení**, rozměry dílů v **3D model → Výrobní výkresy a řezný plán**.

## Kontroly z 3D modelu

Výchozí rozměry, stav 15. 11. 2026.

| Kontrola | Výsledek | Poznámka |
|---|---|---|
| Ponor frézy na desku stolu | ✅ rezerva 9 mm | stojky 285 mm |
| Světlost pod příčníkem | ✅ 213 mm | |
| Pojezd Y | ⚠️ 1 550 mm (deska 1 700 mm) | plnou délku dá kolejnice 2 200 mm |
| Šířka frézování | ⚠️ 679 mm (obrobek 700 mm) | odsávací hubice narazí do vozíků Y |
| Pojezd X | ⚠️ 730 mm (potřeba 739 mm) | užší plexisklo nebo vozíky blíž k sobě |
| Okraj plexiskla | ⚠️ 1 mm | viz otevřené rozhodnutí výše |

## Co chybí ke stavbě bez motorů

- Dorazy na konce všech čtyř kolejnic, aby vozík nesjel z tyče a nevysypal kuličky.
- Spojovací materiál: cca 40× M5 na kolejnice, 32× M6 na vozíky, šrouby modulu Z a adaptéru, velké podložky pod plexisklo.
- Krabice pro měnič s větráním, přívodní kabel, vývodky, ochranný vodič na rám a vřeteno, nouzové tlačítko.
- Olej na vozíky SBR a mazivo na kuličkový šroub.
- Volitelně obětní deska MDF 18 mm a aretace os X a Y pro ruční frézování.

## Náklady

Podle kusovníku v záložce **Kalkulace**:

- **Nejnutnější** (konstrukce, vedení, osa Z, vřeteno): cca 10 900 Kč
- **Vše, co chybí** (včetně motorů a elektroniky): cca 18 500 Kč

Stůl, spodní konstrukce a displej už jsou, do nákladů se nepočítají.
