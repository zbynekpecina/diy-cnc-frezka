# Custom1 až Custom4

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

### Upínání obrobku

Podkladová deska má díry Ø25 v rastru 100 mm napříč a 200 mm podél. Obrobek se upíná dřevěnými kolíky v dírách a klíny zatlučenými mezi kolík a obrobek ze čtyř stran. Kolík ani klín nejsou výš než obrobek, takže nepřekážejí frézování.

### Osa Y

- Kolejnice SBR20 2× 1 800 mm (VEVOR) se čtyřmi vozíky SBR20UU, objednáno 15. 11. 2026.
- Na každé straně dva vozíky s roztečí 200 mm. Spojuje je pásovina 50×6 a jekl 25×25.
- Na zadní vozík je přivařená stojka z jeklu 25×25 (výchozí délka 285 mm). Vzpěra vede od předního vozíku na stejné straně jako vřeteno, takže portál dojede dál na oba konce.

> **Pozor:** Podpěra kolejnice je široká 45 mm a díry má 15 mm od osy. Na profilu 40×40 padnou mimo středovou drážku. Kolejnici je potřeba uchytit nýtovacími maticemi M5 do stěny profilu, nebo přes pásovinu přichycenou do drážky.

### Portál a osa X

- Dva příčníky z jeklu 25×25 jsou přivařené mezi stojky a tvoří jeden rám. Rozteč příčníků je 150 mm, délka 765 mm.
- Pod kolejnicemi je pásovina 50×6, protože díry podpěry SBR20 jsou mimo jekl 25×25.
- Kolejnice SBR20 2× 1 000 mm (SucceBuy) se čtyřmi vozíky SBR20UU, přesah přes rám 72,5 mm na každé straně (Custom1).

### Vozík X a osa Z

- Čtyři vozíky osy X spojuje deska z plexiskla 300 × 200 × 10 mm s otvory na rozteč vozíků 35 × 35 mm (šrouby M6).
- Na desce je hotový modul osy Z se zdvihem 200 mm: dvě vodicí tyče, kuličkový šroub Ø16 a ruční kolo s aretací. Motor NEMA23 se doplní později.
- Vřeteno je na vozíku modulu přes adaptér z hliníkové desky 10 mm (120 × 175 mm). Díry patky vřetena (95 mm od sebe) jsou širší než vozík modulu (80 mm).

> **Otevřené:** Okraj plexiskla nad a pod vozíkem vychází jen 1 mm. Řešení: plexisklo 300 × 220 mm, nebo rozteč příčníků 135 mm (okraj 8,5 mm). Rozhodnout před objednáním plexiskla a svařením portálu.

### Vřeteno a měnič

- HLTNC 2,2 kW GDZ80x73 ER20, 24 000 ot/min, chlazení vzduchem, s měničem EV210 (1F 230 V, RS485). Objednáno 15. 11. 2026 za 4 053 Kč.
- Kleštiny ani klíč ER20 nejsou v sadě. Dokoupit kleštinu 8 mm (srovnávací fréza Ø39 už je koupená) a klíč ER20A.

## Custom1 a Custom2

Návrh má dvě varianty spodní části. Portál, osa X, osa Z, vřeteno a elektronika jsou u obou stejné.

| | Custom1 (hlavní) | Custom2 |
|---|---|---|
| Boční profily | vedle podélných spodních profilů, ve stejné rovině | nad spodními profily na rozpěrkách |
| Opora kolejnice SBR20 (podpěra 45 mm) | dvojice profilů, 80 mm | jeden profil, 40 mm |
| Seřízení výšky | podložky pod profily | závitové tyče Ø25 v rozích |
| Výška vedení | o 90 mm níž | výchozí |
| Stojky portálu | 370 mm | 285 mm |
| Rozteč kolejnic Y | 830 mm | 790 mm |
| Šířka frézování | 719 mm | 679 mm |

Custom1 vznikl kvůli opoře kolejnic: podpěra SBR20 je široká 45 mm a jediný profil jen 40 mm. Na spodní konstrukci zůstává podkladová deska, na kterou se klade obrobek. Popis konstrukce výše odpovídá variantě Custom2, u Custom1 platí změny z tabulky.

## Custom3 – portál z hliníkových profilů

Custom3 má stejnou spodní konstrukci a kolejnice jako Custom1. Mění se portál: místo svařených jeklů 25×25 je z hliníkových drážkových profilů typu 3D tiskárny a skládá se šrouby, bez svařování. V kalkulaci je jen to, co je od vozíků osy Y nahoru (spodní konstrukce, kolejnice s vozíky a modul Z už jsou k dispozici).

**Uspořádání**
- **Spojka vozíků:** na každé straně leží na dvou vozících osy Y profil 30×60 dlouhý 244 mm, naležato, posunutý o 2 mm ven od osy kolejnice (přesah 8 mm). Díry vozíků (35×35) musí být od hrany profilu aspoň 10 mm.
- **Stojky:** na obou koncích spojky stojí svislý profil 30×30 (A vzadu, B vpředu, 4 kusy celkem), vozíky jsou uvnitř mezi nimi a každá stojka je 4,5 mm za hlavou šroubu vozíku. Spoj tvoří plochá deska 40×70 se čtyřmi šrouby na vnější ploše. Spojka končí v rovině s vnějším čelem stojek, úhelník do drážky by potřeboval přesah aspoň 22 mm.
- **Boční rám:** boční profil 30×30 leží na horních koncích stojek A a B a spolu se spojkou tvoří uzavřený rám, rohy jsou vyztužené deskami 4 mm.
- **Osa X:** zadní U nese kolejnice X na dvou příčnících 30×30, 150 mm nad sebou. Kolejnice SBR20 je širší než profil, proto se šroubuje přímo na profil jen jednou řadou děr do drážky (profil je o 15 mm pod osou kolejnice). Pásovina pod kolejnice není potřeba. Přední příčník 30×30 je o 120 mm výš, aby vřeteno v horní poloze Z prošlo pod ním.
- **Držák hadice:** šibenice odpadla. Hadici drží svislý profil 30×30 (400 mm) na zadní stojce na straně vysavače s ramenem 130 mm dovnitř portálu a okem. Hadice vede vnitřkem portálu.

**Rozměry a pracovní plocha**
- Rozteč vozíků Y je 130 mm (u Custom1 200 mm). Pojezd Y je tedy 1 620 mm místo 1 550 mm, pracovní plocha je o 70 mm delší. Rozteč je daná tím, že obě stojky stojí na koncích spojky 300 mm a vozíky jsou mezi nimi.
- Šířka frézování je 711 mm, protože vřetenová hubice musí projet mezi spojkami vozíků.
- Rozteč stojek A a B je 214 mm (osy), boční profil mezi nimi má 184 mm.

**Tuhost (odhad rámovým výpočtem, síla 100 N na nástroji)**
- Posun nástroje při 100 N je asi 0,15 mm ve směru X a 0,06 mm ve směru Y. Výpočet bere profil 3030 jako Ix ≈ 4 cm⁴, E = 70 GPa, rohové desky jako pružné spoje a kolejnici SBR20 jako polovinu přidané tuhosti příčníku (šroubování z jedné strany).
- Hlavní podíl ve směru X (0,13 mm) má natáčení desky vozíku X pod kolejnicemi, ne ohyb stojek.
- Výsledek nezávisí na rozteči vozíků, zatížení vozíků SBR20UU je při tom zanedbatelné (jednotky až desítky N proti 882 N).
- Je to odhad. Skutečnou tuhost zjistí jen zkouška na hotovém stroji (úchylkoměr při zatížení).

**Ověřit před nákupem**
- Skutečný moment setrvačnosti profilů 3030 a 3060 u konkrétního výrobce a rozteč děr na vozících SBR20UU (35×35 je z popisu prodejce).
- Ceny profilů v kusovníku jsou odhad.

| | Custom3 | Custom1 |
|---|---|---|
| Portál | Al drážkové profily, šroubovaný | jekly 25×25, svařený |
| Rozteč vozíků Y | 130 mm | 200 mm |
| Pojezd Y | 1 620 mm | 1 550 mm |
| Spojka vozíků | profil 30×60, 244 mm | pásovina 50×6 + jekl 25×25 |
| Stojky | 4 ks, 494 mm | 2 ks, 370 mm |
| Příčníky | 3× 3030, kolejnice přímo na profilu | 2× jekl 25×25 + pásovina 50×6 |

## Custom4 – Custom1 s ocelovým plechem pod vřetenem

Custom4 je portál ze svařených jeklů 25×25 jako Custom1. Liší se uchycením vřetena: vozík modulu Z má díry 60×30 (M5), patka vřetena 95×35 (M6), takže vřeteno se na vozík přímo nevejde.

- **Plech:** ocel 200 × 100 × 5 mm, na líc vozíku čtyřmi zápustnými šrouby M5×10. Střed plechu je 20 mm pod středem vozíku, díry pro vřeteno jsou 95 × 35 mm.
- **Bočnice:** dvě pásoviny 5 × 50 × 32 mm přivařené k zadní straně plechu, přišroubované do bočních závitů M4 vozíku (M4×10). Plech tak drží ze tří stran.
- **Šrouby:** M5×15 (modul Z na plexi), M6×15 (vozíky Y na pásovinu), M6×20 (vozíky X na plexi), M5×10 zápustné, M4×10.
- **Pozor:** závit M6 v plechu 5 mm je krátký – lépe matice zezadu nebo plech 6–8 mm. Po svaření plech zrovnat.

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

Rozvaděč je zavěšený pod deskou stolu na straně displeje (+X), dvířka ven. Kabelové řetězy X a Y, kabely po portálu a hadice vysavače vedou na opačné straně (−X), aby nepřekážely obsluze. Hadice nemá šibenici: vede od nástavce přes objímku na vozíku X, volnou smyčkou k objímkám na stojce −X, k pevnému bodu na hraně stolu a plynule pod stůl k vysavači. Displej je na obráceném L z jeklu 25×25, který navazuje na rohový jekl motoru Y2.

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
