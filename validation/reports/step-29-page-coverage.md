# Step 29 — All baseline page generation

- Status: PASS
- Date: 2026-08-13
- Baseline pages: 7
- Prototype pages: 7
- Coverage: 100%

## Mapping

| Baseline | Source route | Prototype route | View | Primary Element Plus components |
| --- | --- | --- | --- | --- |
| 运营总览.html | `/#/welcome` | `#/overview` | `OverviewPage.vue` | Row/Col, Card, Statistic, Progress, Table, Tag |
| 首页 - PureAdmin.html | `/#/welcome` | `#/home` | `HomePage.vue` | Card, Timeline, Badge, Alert, Space |
| 用户管理-查询列表.html | `/#/system/user/index` | `#/users` | `UsersPage.vue` | Form, Input, Select, Table, Pagination, Tag |
| 表单 - PureAdmin.html | `/#/form/index` | `#/form` | `FormExamplePage.vue` | Form, Input, Select, Radio, DatePicker, Switch |
| 业务申请表单.html | `/#/form/index` | `#/application` | `ApplicationPage.vue` | Alert, Form, Row/Col, Input, Select, DatePicker |
| 基础编辑弹窗.html | `/#/components/dialog` | `#/dialog-editor` | `DialogEditorPage.vue` | Card, Space, Button, Dialog |
| 账号设置.html | `/#/account-settings` | `#/account-settings` | `AccountSettingsPage.vue` | Card, Tabs, Avatar, Form, Switch, Table |

## Gates

- Typecheck and single-file production build: PASS
- Direct `file://` Hash route and refresh: 7/7 PASS
- Visible menu navigation: 7/7 PASS
- Active menu and breadcrumb: 7/7 PASS
- Duplicate named routes and unreachable menu items: 0
- Page title, fields and main language traceable to baselines: PASS
- Baseline SHA256: unchanged 7/7

The open dialog on `#/dialog-editor` intentionally reproduces the capture state; the navigation test closes it through its visible Cancel button before continuing.
