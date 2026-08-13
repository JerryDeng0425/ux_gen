export interface BaselinePage {
  file: string;
  title: string;
  sourceRoute: string;
  prototypeRoute: string;
  family: 'dashboard' | 'table' | 'form' | 'dialog' | 'settings';
}

export const baselinePages: BaselinePage[] = [
  { file: '运营总览.html', title: '运营总览', sourceRoute: '/#/welcome', prototypeRoute: '/overview', family: 'dashboard' },
  { file: '首页 - PureAdmin.html', title: '首页', sourceRoute: '/#/welcome', prototypeRoute: '/home', family: 'dashboard' },
  { file: '用户管理-查询列表.html', title: '用户管理', sourceRoute: '/#/system/user/index', prototypeRoute: '/users', family: 'table' },
  { file: '表单 - PureAdmin.html', title: '表单示例', sourceRoute: '/#/form/index', prototypeRoute: '/form', family: 'form' },
  { file: '业务申请表单.html', title: '业务申请', sourceRoute: '/#/form/index', prototypeRoute: '/application', family: 'form' },
  { file: '基础编辑弹窗.html', title: '弹窗编辑', sourceRoute: '/#/components/dialog', prototypeRoute: '/dialog-editor', family: 'dialog' },
  { file: '账号设置.html', title: '账号设置', sourceRoute: '/#/account-settings', prototypeRoute: '/account-settings', family: 'settings' }
];
