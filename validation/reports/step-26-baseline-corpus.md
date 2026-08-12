# Step 26 — Pure Admin HTML baseline corpus

- Status: PASS
- Date: 2026-08-13
- Source: Pure Admin `v7.0.0` at `http://127.0.0.1:4178`
- Recorder captures: 8
- Final HTML files: 7
- Non-HTML files in `baseline/pages`: 0

## Inventory and immutable hash baseline

| File | Bytes | SHA256 |
| --- | ---: | --- |
| 表单 - PureAdmin.html | 1,176,475 | `FA7828342B980C201C01F0F8F98D5F001C20B84E5FA3B388545BEA339B974C60` |
| 基础编辑弹窗.html | 1,359,288 | `2228AA93F5369E0F30414BA63971329C99517C821319F64EA29348593973AECD` |
| 首页 - PureAdmin.html | 1,159,564 | `6F11E54565907A9DABD122D0D9866BD13B203D2D7588AD50F1BB57758538E4F2` |
| 业务申请表单.html | 1,378,515 | `5827FFD48E16DFB4903E5C87554B6DDCC643E427A63679F43C908A28EAB73E97` |
| 用户管理-查询列表.html | 1,451,900 | `B1EBC59484857713280EBB090C4C794231AA4C47592F0CE535EB79FC0074901F` |
| 运营总览.html | 1,159,547 | `03097698B702632A9C9077586D20BE08A8904CCACBFB9A93EF0A938CDA8B8F7A` |
| 账号设置.html | 1,134,057 | `98CB5479698DC709AB05F3A56E333944812A9130008E9E9DDF3D655EAFC054D9` |

## Coverage

- Dashboard/navigation: `运营总览.html` and button-triggered `首页 - PureAdmin.html`
- Query/list: `用户管理-查询列表.html`, re-recorded under the same name with the latest “小林” filter state
- Form/detail: hotkey-triggered `表单 - PureAdmin.html` plus semantic `业务申请表单.html`
- Open dialog: `基础编辑弹窗.html`, contains “弹框内容-基础用法”
- Account settings/theme: `账号设置.html`

## Gates

- Terminal capture: PASS
- In-page capture button: PASS
- Ctrl+Shift+Y capture: PASS
- Same-name overwrite: PASS; two `用户管理-查询列表` captures produce one final HTML
- Validator: 7/7 PASS
- Script, inline event, javascript URL, meta refresh, capture control: 0
- Expected warnings: upstream code-inspector open Shadow DOM; canvas pixels on dashboard charts. No bitmap sidecar is created.
- Baseline data and language spot checks: PASS

Steps 27–33 and 35 must compare these SHA256 values before and after execution. Only Step 34 may update the baseline through the recorder and must establish a new hash generation.
