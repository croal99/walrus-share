export interface SettingOnStore {
    username: string;
    password: string;
    salt: string;
    aggregator: string,
    publisher: string,
    walrusHash: string,       // walrus加密key
    walrusSalt: string,       // walrus加密sale
}
