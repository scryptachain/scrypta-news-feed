import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import New from './views/New.vue'
import Login from './views/Login.vue'
import News from './views/News.vue'

Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/new',
      name: 'new',
      component: New
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/news/:uuid',
      name: 'News',
      component: News
    }
  ]
})
