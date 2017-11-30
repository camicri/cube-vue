import Vue from 'vue'
import Router from 'vue-router'
import Startup from '@/components/startup'
import Main from '@/components/main'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/s',
    //   name: 'Startup',
    //   component: Startup
    // },
    {
      path: '/main',
      name: 'Main',
      component: Main
    },
    {
      path: '/',
      name : 'Startup',
      component : Startup,
    }
  ]
})
