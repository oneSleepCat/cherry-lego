import { createRouter, createWebHistory } from 'vue-router';
import Index from '../views/Index.vue';
import Home from '../views/Home.vue';
import Editor from '../views/Editor.vue';
import TemplateDetail from '../views/TemplateDetail.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'index',
			component: Index,
			children: [
				{
					path: '',
					component: Home,
				},
				{
					path: 'template/:id',
					name: 'template',
					component: TemplateDetail,
				},
			],
		},
		{
			path: '/editor',
			name: 'editor',
			component: Editor,
		},
	],
});

export default router;
