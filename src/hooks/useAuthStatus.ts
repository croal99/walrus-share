import localforage from "localforage";
import {UserOnStore} from "@/types/UserOnStore.ts";
import CryptoJS from "crypto-js";
import {getSetting} from "@/hooks/useLocalStore.ts";

interface AuthProvider {
    isAuthenticated: boolean;
    username: null | string;
    signin(username, password: string): Promise<boolean>;
    signout(): Promise<void>;
    getUser(): Promise<UserOnStore>;
}

const KEY_USER = "user";

export const apiAuthProvider: AuthProvider = {
    isAuthenticated: false,
    username: null,
    async signin(username: string, password: string) {
        // await new Promise((r) => setTimeout(r, 500)); // fake delay
        const setting = await getSetting();
        const userInfo: UserOnStore = {
            username,
            password,
        };

        const tempPassword = setting.salt + ':' + CryptoJS.SHA1(password + setting.salt).toString();
        if (tempPassword === setting.password) {
            apiAuthProvider.isAuthenticated = true;
            apiAuthProvider.username = username;
            await localforage.setItem(KEY_USER, userInfo);
            return true;
        } else {
            await apiAuthProvider.signout()
            return false;
        }
    },
    async signout() {
        // await new Promise((r) => setTimeout(r, 500)); // fake delay
        apiAuthProvider.isAuthenticated = false;
        apiAuthProvider.username = "";
        await localforage.removeItem(KEY_USER);
    },
    async getUser() {
        return await localforage.getItem(KEY_USER)
    },
};

