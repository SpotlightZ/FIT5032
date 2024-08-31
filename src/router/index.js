import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import RegisterView from '../views/RegisterView.vue'
import StaffView from '../views/StaffView.vue'
import ContactView from '../views/ContactView.vue'
import ManagePet from '../views/ManagePet.vue'
import FindView from '../views/FindView.vue'
import AdoptView from '../views/AdoptView.vue'
import ArticlesView from '../views/ArticlesView.vue'
import { useUserStore } from "@/store";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue")
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: "/",
    redirect: "/login",
    component: MainView,
    children: [
      {
        path: 'home',
        name: 'Home',
        component: HomeView
      },
      {
        path: 'about',
        name: 'About',
        component: AboutView
      },
      {
        path: 'staff',
        name: 'Staff',
        component: StaffView
      },
      {
        path: 'contact',
        name: 'Contact',
        component: ContactView
      },
      {
        path: 'managePet',
        name: 'ManagePet',
        component: ManagePet
      },
      {
        path: 'find',
        name: 'Find',
        component: FindView
      },
      {
        path: 'adopt',
        name: 'Adopt',
        component: AdoptView
      },
      {
        path: 'articles',
        name: 'Articles',
        component: ArticlesView
      }
    ]
  }
]

let userStore = useUserStore;

const router = createRouter({
  history: createWebHistory(),
  routes
})

function getUserAuthStatus() {
  // Determine user whether to log in
  return Boolean(localStorage.getItem('loggedInUser'));
}

router.beforeEach((to, _, next) => {
  const isAuthenticated = getUserAuthStatus();
  if (!userStore) {
    userStore = useUserStore();   
  }

  // if (to.path !== "/login" && !isAuthenticated) {
  if (to.path !== "/login" && to.path !== "/register" && !isAuthenticated) {
    next("/login");
    return;
  }
  next();
});

export default router