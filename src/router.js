import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import New from './views/New.vue'
import News from './views/News.vue'
import Author from './views/Author.vue'
import Edit from './views/Edit.vue'
import Publisher from './views/Publisher.vue'
import Publish from './views/Publish.vue'
import Gravatar from 'vue-gravatar'

Vue.use(Router)
Vue.component('v-gravatar', Gravatar);

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
      path: '/news/:uuid',
      name: 'News',
      component: News
    },
    {
      path: '/edit/:uuid',
      name: 'Edit',
      component: Edit
    },
    {
      path: '/author/:address',
      name: 'Author',
      component: Author
    },
    {
      path: '/publisher/:pubkey',
      name: 'Publisher',
      component: Publisher
    },
    {
      path: '/publish',
      name: 'Publish',
      component: Publish
    }
  ]
})
