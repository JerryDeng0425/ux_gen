# Upstream provenance

| Field | Value |
| --- | --- |
| Repository | `https://github.com/jiaiyan/element-plus-skills` |
| Commit | `1d126b39a80523665cc6290f70ce25aa89d708ae` |
| Retrieved | `2026-08-13` |
| License | MIT; see `LICENSE` |
| Files | 93 |
| Canonical tree SHA256 | `18E55CFB4CF08DED015D5464179870B4CAFE66F4640F076999341B31164ECA79` |

The canonical tree hash is SHA256 over UTF-8 lines in the form `<file SHA256><two spaces><repo-relative path>`, using the file order returned by `rg --files skills/element-plus`, before this provenance file was added.

## Required reference coverage

| Area | Repository reference |
| --- | --- |
| Quickstart and component overview | `element-plus-quickstart`, `element-plus-components` |
| Theme | `element-plus-theming`, `element-plus-dark-mode` |
| Design system | `element-plus-design-overview`, `-layout`, `-color`, `-typography`, `-border` |
| Navigation | `components/el-menu`, `components/el-breadcrumb` |
| Basic input and forms | `el-button`, `el-input`, `el-select`, `el-form` |
| Data presentation | `el-table`, `el-pagination`, `el-descriptions`, `el-tabs` |
| Feedback and overlays | `el-dialog`, `el-drawer`, `el-message`, `el-notification`, `el-popconfirm` |
| Additional controls | `el-date-picker`, `el-checkbox`, `el-radio`, `el-switch`, `el-upload` |

All 89 upstream `SKILL.md` files passed the local skill structure validator with UTF-8 mode enabled. These are component/design references, not a prototype-generation agent or end-to-end workflow skill.

## Upgrade contract

Upgrades are explicit only: select a new full commit SHA, download to a fresh temporary location, review the diff and license, rerun all 89+ structure checks and the required reference matrix, then update this file and the canonical hash. Never consume a floating branch at prototype-generation time.
