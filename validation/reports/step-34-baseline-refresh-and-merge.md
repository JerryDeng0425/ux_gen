# Step 34 — Controlled baseline refresh and merge

- Status: PASS
- Date: 2026-08-13
- Refreshed page: `baseline/pages/用户管理-查询列表.html`
- Baseline before: `B1EBC59484857713280EBB090C4C794231AA4C47592F0CE535EB79FC0074901F`
- Baseline after: `14956E1F734097FB0AC9AF83F4BB31EDAC050B7C65D8D87A7550C1E0F5A4B22C`

## Isolation proof before merge

The recorder captured exactly one HTML with the same normalized name. The baseline directory remained seven HTML files and no history/sidecar file was created.

| Scope | Before digest | After refresh, before merge | Result |
| --- | --- | --- | --- |
| `prototype/src` tree | `64BB6809900980AECE899566A9EE80DF7AAB30FC9A06A333ABD77F0AE8A222BF` | same | unchanged |
| `tests/prototype` tree | `860735EE0B8F35E9C540EC5E45266F118D9E65A9E01515A09F6171D34264A94A` | same | unchanged |
| delivery ZIP | `7594245C71E01D783D6BDD7A7FE4CE7E7DBC04E1A88BD66630792307AD8A7478` | same | unchanged |

All seven captures passed HTML validation. Expected serializer warnings about open shadow DOM (and canvas non-embedding on dashboard captures) are non-blocking and remain explicit.

## Difference and merge decision

| Dimension | Finding | Decision |
| --- | --- | --- |
| Route/title | Still `/#/system/user/index`, “用户管理” | no structural change |
| Updated state/wording | Query state changes from `小林` to `小铭` | update prototype default query and its test |
| Current prototype-only requirements | priority filter/column/editor field and `/user-exceptions` from Step 33 | preserve without alteration |
| Conflict | none: baseline query-state change is independent of Step 33 additions | minimal merge approved |
| Unknown | none material to the recorded DOM state | proceed |

The user required the complete plan sequence without human intervention. Therefore this report records an auditable agent approval after the isolation/difference checks; it does not claim a human signature.

## Post-merge gates

- Prototype typecheck/build: PASS
- Baseline validator: 7/7 PASS
- Chrome suite: 8/8 PASS
- Edge suite: 8/8 PASS
- Offline asset audit: PASS; external/forbidden references: 0
- Extracted ZIP Chrome suite: 8/8 PASS
- Extracted ZIP Edge suite: 8/8 PASS
- Extracted path: `%TEMP%\新基线 合并包 step34\`
- Final dist index SHA256: `7362F6843DBE1B271293611B715C7A455A83E643422AD62B91888003E78CBACA`
- Final ZIP SHA256: `F861AD2FE96EC47F22A569895BE3BAB8C40FBDA6BA78F65C8BA7CE1C388E6E03`
- Git HEAD before/after: `9b635deafcad59fb79e9cfbb64703968deeffb93` (unchanged)
- New merge engine, page agent, version center or Skill: 0
