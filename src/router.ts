import { createRouter, createWebHistory } from 'vue-router';
import EditorView from './views/EditorView.vue';
import OutputView from './views/OutputView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'editor', component: EditorView },
    { path: '/view', name: 'view', component: OutputView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
