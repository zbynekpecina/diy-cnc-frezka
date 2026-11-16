# Software: CAM a sendery

Přehled programů pro tvorbu G-kódu (CAM) a jeho odesílání do stroje (sender) s ohledem na FluidNC. Rešerše z 15. 11. 2026.

G-kód FluidNC je kompatibilní s Grbl, proto funguje libovolný postprocesor pro Grbl.

## Přehled programů

| Software | Cena | Postprocesor | Poznámka |
|---|---|---|---|
| **Estlcam** | 49 € (aktualizace 19 €), [estlcam.de](https://estlcam.de/estlcam.php) | „GRBL“ nebo fluid.pp (V1E, s probingem) | ✅ nejrychlejší start, 2.5D, přívětivý pro české uživatele; pozor na jednotky posuvu |
| **Fusion (Personal Use)** | zdarma pro nekomerční použití, obnova po roce | Autodesk „Grbl“ ([blog](https://www.autodesk.com/products/fusion-360/blog/fusion-360-grbl-post/)), komunitní post Flyfisher604 | 3D; od 10/2020 rapidy G0 → G1 (platnost v roce 2026 [neověřeno]) |
| Carbide Create | základ zdarma | export GRBL | jednoduchý 2.5D, V-carve |
| Kiri:Moto | zdarma, v prohlížeči | profil GRBL | bez instalace |
| FreeCAD 1.x CAM | zdarma, open source | `grbl_post` | výkonný, náročný na naučení |
| **FluidNC WebUI v3** | vestavěné | – | sender přes WiFi z prohlížeče, PC není nutné |
| gSender (Sienci) | zdarma | – | primárně grbl/grblHAL, FluidNC neoficiálně |
| UGS | zdarma | – | grbl, grblHAL i FluidNC |
| CNCjs | zdarma | – | webový sender (Raspberry Pi) |
| ioSender | zdarma | – | Windows, pro grblHAL |
| LightBurn | ~99 USD [neověřeno] | GRBL | jen pro případný laser |

## Doporučení pro náš stroj

- Srovnávání desek frézou Ø39 a 2.5D práce: **Estlcam**.
- 3D obrábění: **Fusion Personal**.
- Odesílání G-kódu: **FluidNC WebUI**.

> **Aktuální stav:** Pendant FluidTouch nepoužijeme (podporuje jen CrowPanel ESP32-S3). 7" displej ESP32-P4 má vlastní firmware.
