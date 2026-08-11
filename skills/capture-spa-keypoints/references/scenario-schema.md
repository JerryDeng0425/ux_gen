# Scenario schema

Required root fields:

- `id`: lowercase hyphenated identifier.
- `version`: scenario contract version.
- `startUrl`: absolute URL.
- `keypoints`: ordered non-empty array.

Optional root fields: `captureMode` (`exact` or `settled`), `hotkey`, `outputDir`, and `redactSelectors`.

Each keypoint requires `id`, `name`, and `instruction`. Optional fields are `assertions`, `maskSelectors`, and `redactSelectors`.

Assertion types:

- `{ "type": "url", "includes": "/users" }`
- `{ "type": "exists", "selector": "[role=dialog]" }`
- `{ "type": "text", "selector": "h1", "includes": "Users" }`
- `{ "type": "attribute", "selector": "main", "name": "class", "equals": "theme-dark" }`
- `{ "type": "value", "selector": "input", "equals": "Test" }`
- `{ "type": "checked", "selector": "input[type=checkbox]", "equals": true }`

Prefer semantic selectors and version public-site scenarios whenever selectors or workflow semantics change.
