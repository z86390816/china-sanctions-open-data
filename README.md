# Open sanctions data: China MOFCOM & EU Annex IV

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.21851071.svg)](https://doi.org/10.5281/zenodo.21851071)
[![Licence: CC BY 4.0](https://img.shields.io/badge/licence-CC%20BY%204.0-blue.svg)](LICENSE)

Two sanctions / export-control lists that are **hard to obtain in machine-readable form**, published here as JSON and CSV with bilingual field values and source attribution.

Maintained by [TradeProtected](https://tradeprotected.com) — a free sanctions-screening tool for commodity trade.

---

## Why these two lists

Most sanctions data is already well served: OFAC, the UN and the EU financial-sanctions database all publish machine-readable files, and [OpenSanctions](https://www.opensanctions.org/) aggregates them — **including the Chinese lists below**, which it compiles independently. Re-publishing that adds nothing.

What these files offer is a different shape, not exclusive access:

| Dataset | Why it is hard to get |
|---|---|
| **China MOFCOM** | The Unreliable Entity List, the export-control list and the anti-foreign-sanctions countermeasure list exist only as individual Chinese-language announcements; there is no official structured version. Here every row carries both the Chinese and the English name in separate columns, plus the issuing authority and announcement number in `remarks`, so it can be checked against the original notice. That Chinese-to-English name mapping is the link most likely to break when screening runs on English names alone. |
| **EU Annex IV** | The military end-user list is buried inside the consolidated text of Council Regulation (EU) No 833/2014. Getting it as rows means parsing the regulation's annex. |

If you are screening counterparties in China ↔ Russia / Central Asia / Middle East trade, the MOFCOM list is the one your existing tooling is most likely missing.

## Files

| File | Rows | Contents |
|---|---|---|
| `china-mofcom.json` / `.csv` | 196 | Unreliable Entity List (33) + export-control list (120) + anti-foreign-sanctions countermeasure list (43) |
| `eu-annex-iv.json` / `.csv` | 921 | Regulation 833/2014 Annex IV military end-users |
| `manifest.json` | — | Dataset index: counts, files, source URLs, generation date |

CSV files carry a UTF-8 BOM so non-Latin text opens correctly in Excel.

## Schema

Both datasets share these columns:

| Field | Notes |
|---|---|
| `name` | Name exactly as published |
| `name_zh` / `name_en` | Split out of bilingual names where a clean split is possible; empty otherwise — never a guess |
| `type` | `entity` / `individual` / `vessel` / `aircraft` |
| `programs` / `programs_en` | Listing programme, original and English |
| `country` / `country_en` | Jurisdiction, original and English |
| `listed_on` | ISO date, when officially stated |
| `remarks` | Original free text. For MOFCOM this is the announcement wording (penalties, scope, dates) and is **not** translated |

`eu-annex-iv` adds fields parsed out of `remarks`:

`local_name` (Cyrillic/local-script name), `aliases`, `address`, `registration_number`, `website`

## Sources

- **China MOFCOM** — <https://www.mofcom.gov.cn/>, compiled from individual announcements
- **EU Annex IV** — EUR-Lex consolidated text of Regulation (EU) No 833/2014, [CELEX:02014R0833](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02014R0833)

Always verify against the official source before acting. These files are a convenience layer, not the record.

## Updates

Regenerated when the underlying lists change. `generated_at` in each file and in `manifest.json` tells you how current a copy is. Watch or star the repository to get notified.

Found something wrong or missing — a new designation, a bad name split, a wrong date? Open an issue. Corrections are welcome and get applied to the live screening tool too.

## Citation

Archived on Zenodo with a DOI, so the reference stays valid regardless of what happens to
this repository or the site:

```
TradeProtected (2026). China sanctions and export-control lists, and EU Regulation 833/2014
Annex IV, in machine-readable form. Zenodo. https://doi.org/10.5281/zenodo.21851071
```

Each data update is archived as a new version under the same record, so the reference above
does not need to change.

## Licence

**CC BY 4.0** ([full text](LICENSE)). Use it commercially, redistribute it, build on it. Just keep the attribution — either form works:

```
Data compiled by TradeProtected — https://tradeprotected.com
```
```html
<a href="https://tradeprotected.com">TradeProtected</a>
```

The underlying facts — who is designated, by whom, on what date — are published by government authorities and are not themselves subject to copyright. What the licence covers is the compilation: the selection of sources, the Chinese/English name mapping, the field structure and the source attribution.

Provided as is, with no warranty.

## Related

- **Free screening, no signup** — <https://tradeprotected.com> searches these lists plus OFAC, the UN and the EU financial-sanctions database (~27,000 entries, refreshed daily)
- **HTTP API** — <https://tradeprotected.com/api-docs> if you would rather query than sync
- **Embeddable widget** — a search box you can drop into your own site with one `<iframe>`, free

## Disclaimer

A name match is a due-diligence signal, not a legal conclusion. Namesakes and transliteration differences produce both false positives and false negatives. Nothing here is legal advice.

---

<a name="zh"></a>

## 中文说明

这里发布两份**难以获得机器可读版本**的名单，JSON 与 CSV 双格式，字段中英对照并标注官方出处。由 [TradeProtected](https://tradeprotected.com) 整理维护。

**为什么只发这两份**：OFAC、联合国、欧盟金融制裁的数据发布方本身就提供结构化文件，OpenSanctions 这类聚合项目也已收录（中国这几份它同样独立整理了），再发一遍没有意义。这里给的是另一种形态，不是独家来源——

- **不可靠实体清单（33）/ 出口管制管控名单（120）/ 反外国制裁反制清单（43）**，共 196 条：官方只以一条条中文公告的形式发布，没有任何结构化版本。这里中文名与英文名分列（196 条全部配有英文名），每条在 `remarks` 里标了发布部门与公告号，可回查原文。中文名与英文名的对应关系，正是拿英文名做筛查时最容易断掉的一环。
- **欧盟 833/2014 附件 IV 军事最终用户**（921 条）：埋在 EUR-Lex 的合并法条文本里，要自己从附件中抠出来。

**字段**：`name` / `name_zh` / `name_en` / `type` / `programs(_en)` / `country(_en)` / `listed_on` / `remarks`。附件 IV 另有从备注中解析出的 `local_name`（俄文原名）、`aliases`、`address`、`registration_number`、`website`。中英双名拆不开时留空，不做猜测。CSV 带 UTF-8 BOM，Excel 直接双击打开不乱码。

**许可**：CC BY 4.0，可商用、可再分发，保留署名即可 —— `数据整理：TradeProtected — https://tradeprotected.com`

**更正**：发现漏列、错列、日期有误或名称拆分不对，欢迎提 issue，改动会同步到线上查询工具。

**免责**：名称命中只是尽职调查的提示，不是法律结论；同名、音译差异都会造成误报漏报。以官方原始记录为准。
