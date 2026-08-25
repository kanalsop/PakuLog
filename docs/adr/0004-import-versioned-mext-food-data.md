# ADR-0004: Import versioned MEXT food data

- Status: Accepted
- Date: 2026-08-24

In the context of calculating meal nutrients reproducibly while supporting searches such as
`サンマ`, `さんま`, and `秋刀魚`, facing a public source whose corrections and non-numeric nutrient
notations must remain auditable, we decided for immutable release-labelled imports of the MEXT
Standard Tables of Food Composition with separate food, normalized search-term, and nutrient-value
records and against runtime scraping or opaque nutrient JSON, to preserve source identity, aliases,
units, and measured, estimated, trace, or missing value semantics, accepting an explicit import step
and ongoing maintenance of curated aliases when the source does not provide them.
