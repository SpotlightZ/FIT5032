import { createPinia, defineStore } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// import { useRouter } from 'vue-router';


// const router = useRouter();
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const useUserStore = defineStore("user",
    {
        state: () => ({
            users: [
                { userName: 'admin', password: 'Zxc1234,', role: 'admin' },
                { userName: 'user', password: 'Zxc1234,', role: 'user' },
                { userName: 'guest', password: 'Zxc1234,', role: 'guest' }
            ],
            loggedInUser: null,
        }),
        actions: {
            logout() {
                this.loggedInUser = null;
                localStorage.removeItem('loggedInUser');
                alert('Logged out');
            },
            login(userName, password) {
                const user = this.users.find(
                    (u) => u.userName === userName && u.password === password
                );
                if (user) {
                    this.loggedInUser = user;
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                    alert('Login successful');

                } else {
                    alert('Login failed: Incorrect username or password');
                }
                // this.loggedInUser = true;
                // this.username = username;
            },
            loadUserFromLocalStorage() {
                const user = JSON.parse(localStorage.getItem('loggedInUser'));
                if (user) {
                    this.loggedInUser = user;
                }
            }
        },
        getters: {
            isAuthenticated: (state) => !!state.loggedInUser,
            currentUser: (state) => state.loggedInUser,
            isAdmin: (state) => state.loggedInUser?.role === 'admin',
            isUser: (state) => state.loggedInUser?.role === 'user',
            isGuest: (state) => state.loggedInUser?.role === 'guest'
        },
        persist: true
    }
);

const useSysConfigStore = defineStore("sys-config",
    {
        state: () => ({
            hospitalName: "",
            departmentName: "",
            taskExportFilePath: "",
            isShowPopoverNavigator: true,
        }),
        actions: {
            saveHospitalName(name) {
                this.hospitalName = name;
            },
            saveTaskExportFilePath(path) {
                this.taskExportFilePath = path;
            }
        },
        persist: true
    }
);


export { useUserStore, useSysConfigStore, pinia }