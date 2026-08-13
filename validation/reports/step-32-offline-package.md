# Step 32 — Offline build and ZIP

- Status: PASS
- Date: 2026-08-13
- Dist index SHA256: `273FEDEB669EA24F831D7C85C8B86C4135D8D452E73719D740C27C50D197476C`
- ZIP SHA256: `E25DFFF011F4134D28F8C92A8D23049CC831F5112716819312B7768BFFB4FFC0`
- Extracted test path: `%TEMP%\原型 验收包 step32\`

## Archive inventory

| Entry | Bytes | Compressed bytes |
| --- | ---: | ---: |
| `index.html` | 1,401,614 | 391,516 |
| `README.txt` | 272 | 212 |

## Gates

- Root `index.html`: PASS; extra nesting: 0
- Unsafe absolute/`..` entries, source, node_modules, reports, temporary files: 0
- External script/style/image and missing local references: 0
- Service worker, source map, absolute drive/root resource references: 0
- Runtime HTTP(S) requests in offline mode: 0
- Chinese + space extraction path: PASS
- Chrome offline package routes/interactions/layout: 6/6 PASS
- Edge offline package routes/interactions/layout: 6/6 PASS
- Combined: 12/12 PASS
- Extracted index hash equals dist index hash: PASS
- Baseline SHA256 unchanged: 7/7

Playwright proves direct `file://` loading, routing and interaction behavior. It cannot prove Windows file association or the physical OS double-click gesture. Under the user's no-human-intervention instruction, the automated equivalent is accepted for this run and the distinction is retained in the evidence.
