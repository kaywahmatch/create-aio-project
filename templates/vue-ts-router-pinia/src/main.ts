import { createApp } from 'vue';
import '/@/less/tailwind.css';
import '/@/less/index.less';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);

app.mount('#app');
