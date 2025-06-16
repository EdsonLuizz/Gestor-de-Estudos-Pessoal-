import { createRouter, createWebHistory } from 'vue-router';
// Importe o LoginPage com o nome correto
import LoginPage from '../components/LoginPage.vue';
import HomePage from '../components/HomePage.vue';
import PomodoroPage from '../components/PomodoroPage.vue'; 
import RegisterPage from '../components/RegisterPage.vue';
import StudyPlanPage from '../components/StudyPlanPage.vue';
import RemindersPage from '../components/RemindersPage.vue';
import DefineGoalPage from '../components/DefineGoalPage.vue';
import RegisterStudySessionPage from '../components/RegisterStudySessionPage.vue';
import ManageSubjectsPage from '../components/ManageSubjectsPage.vue';
import ReportPreviewPage from '../components/ReportPreviewPage.vue';

const routes = [
  {
    // Rota para o caminho raiz (ex: http://localhost:5173/)
    path: '/',
    // Vamos redirecionar o caminho raiz para a página de login
    redirect: '/login'
    // Alternativamente, se você quisesse que a LoginPage fosse a tela inicial sem redirecionamento:
    // name: 'Home', // Ou qualquer outro nome
    // component: LoginPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage, // Agora LoginPage está definido corretamente
  },
  {
  path: '/home',
  name: 'Home',
  component: HomePage,
  },
  {
    path: '/login',
    redirect: '/login'
  },
  {
    path: '/pomodoro',
    name: 'Pomodoro',
    component: PomodoroPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/planodeestudos', // ou o caminho que preferir
    name: 'StudyPlan',
    component: StudyPlanPage,
    // meta: { requiresAuth: true } // Se precisar de autenticação
  },
  {
    path: '/lembretes', // Ou o caminho que você já usa no navbar
    name: 'Reminders',
    component: RemindersPage,
    meta: { requiresAuth: true } // Provavelmente requer autenticação
  },
  { // <<< NOVA ROTA
    path: '/definir-meta',
    name: 'DefineGoal',
    component: DefineGoalPage,
    meta: { requiresAuth: true } // Geralmente requer autenticação
  },
  {
    path: '/registrar-sessao',
    name: 'RegisterStudySession',
    component: RegisterStudySessionPage,
    meta: { requiresAuth: true } // Provavelmente precisa de autenticação
  },
  {
    path: '/materias', // Este é o caminho usado no seu AppNavbar
    name: 'ManageSubjects',
    component: ManageSubjectsPage,
    meta: { requiresAuth: true } // Provavelmente requer autenticação
  },
  {
    path: '/relatorio-desempenho',
    name: 'ReportPreview',
    component: ReportPreviewPage,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;