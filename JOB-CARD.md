# Job Card — Book Record Enrichment

## Input

A book record containing:

- `title`: required string, 1–300 characters
- `description`: required field that may contain a string up to 5000 characters or `null`

## Output

A structured JSON object:

```json
{
  "category": "fiction | nonfiction | business | technology | history | science | biography | poetry | other",
  "summary": "short summary based only on the supplied title and description",
  "quality_flags": [
    "missing_description | weak_description | uncertain_category"
  ]
}