import { createRouter, createWebHistory } from 'vue-router'
import ResultsPage from '@/pages/ResultsPage.vue'
import PitchGame from '@/pages/PitchGame.vue'
import Record from '@/pages/Record.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Record,
  },
  {
    path: '/results',
    name: 'Results',
    component: ResultsPage,
    props: true,
  },
  {
    path: '/exercise',
    name: 'Exercise',
    component: PitchGame,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
