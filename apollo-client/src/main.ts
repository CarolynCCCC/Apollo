import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/index.scss'
import { router } from './index'
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArrowRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import piniaPersist from 'pinia-plugin-persistedstate'

library.add(faArrowRightFromBracket, faUser);

const pinia = createPinia()
pinia.use(piniaPersist)
const app = createApp(App)
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(pinia)
app.use(router)
app.mount('#app')
