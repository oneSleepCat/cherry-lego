import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import router from './routes/index';
import store from './store/index';
import App from './App.vue';
import 'ant-design-vue/dist/antd.css';
import './style/reset.css';


const app = createApp(App);

app.use(Antd).use(router).use(store);

app.mount('#app');
