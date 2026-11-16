# Státnice SWI

Interaktivní procvičování ke státnicím z Aplikované informatiky (FIM UHK). Dva předměty, mezi kterými se přepíná nahoře na stránce:

- **Software** – Softwarové inženýrství: 22 okruhů, 530 otázek a pojmů
- **Hardware** – Technické a softwarové prostředky: 19 okruhů, 549 otázek a pojmů

Ke každé otázce je vysvětlení.

## Herní režimy

- **Státnice nanečisto** – vylosuj dva okruhy a přesvědč komisi (12 otázek, 3 pokusy na chybu)
- **Kvíz** – 10 otázek, série správných odpovědí zvyšuje body
- **Kartičky** – pojem a definice, co neumíš, uvidíš příště dřív
- **Přiřazovačka** – spoj šest pojmů s definicemi na čas
- **Bleskovka** – 60 sekund, chyba stojí 3 sekundy
- **Seřaď postup** – fáze, cykly a kroky algoritmů ve správném pořadí

Postup (XP, levely, razítka v indexu, zvládnutí okruhů) se ukládá v prohlížeči, zvládnutí se počítá pro každý předmět zvlášť.

## Spuštění

Stačí otevřít `index.html` v prohlížeči. Je to jeden soubor bez závislostí, takže jde rovnou nasadit na GitHub Pages.

## Úpravy

Zdrojové soubory jsou ve složce `src/`:

| Soubor | Obsah |
|---|---|
| `data1.js`–`data3.js` | Software: pojmy (`t`), otázky (`q`), pravda/nepravda (`tf`), postupy k seřazení (`ORDERS`) |
| `hw1.js`–`hw5.js` | Hardware: stejná struktura, postupy v `HW_ORDERS` |
| `expl.js` | vysvětlení k otázkám |
| `logic.js` | předměty, stav, levely, odznaky, výběr otázek |
| `ui.js` | obrazovky a herní režimy |
| `share.js` | výzva pro kamarády, synchronizace |
| `shell.html` | HTML a CSS |

Po úpravě spusť `python3 build.py`, který z nich znovu sestaví `index.html`.
