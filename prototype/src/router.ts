import { createRouter, createWebHashHistory } from 'vue-router';
import FoundationPage from './views/FoundationPage.vue';
import NotFoundPage from './views/NotFoundPage.vue';
import OverviewPage from './views/OverviewPage.vue';
import HomePage from './views/HomePage.vue';
import UsersPage from './views/UsersPage.vue';
import FormExamplePage from './views/FormExamplePage.vue';
import ApplicationPage from './views/ApplicationPage.vue';
import DialogEditorPage from './views/DialogEditorPage.vue';
import AccountSettingsPage from './views/AccountSettingsPage.vue';
import UserExceptionsPage from './views/UserExceptionsPage.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/foundation' },
    { path: '/foundation', name: 'foundation', component: FoundationPage, meta: { title: '原型工程基础' } },
    { path: '/overview', name: 'overview', component: OverviewPage, meta: { title: '运营总览', section: '首页' } },
    { path: '/home', name: 'home', component: HomePage, meta: { title: '工作台', section: '首页' } },
    { path: '/users', name: 'users', component: UsersPage, meta: { title: '用户管理', section: '系统管理' } },
    { path: '/user-exceptions', name: 'user-exceptions', component: UserExceptionsPage, meta: { title: '异常用户', section: '系统管理' } },
    { path: '/form', name: 'form-example', component: FormExamplePage, meta: { title: '表单示例', section: '表单页面' } },
    { path: '/application', name: 'application', component: ApplicationPage, meta: { title: '业务申请', section: '表单页面' } },
    { path: '/dialog-editor', name: 'dialog-editor', component: DialogEditorPage, meta: { title: '弹窗编辑', section: '组件' } },
    { path: '/account-settings', name: 'account-settings', component: AccountSettingsPage, meta: { title: '账号设置', section: '个人中心' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage, meta: { title: '页面不存在' } }
  ]
});

router.afterEach((route) => {
  document.title = `${String(route.meta.title ?? '业务原型')} - PureAdmin 原型`;
});
