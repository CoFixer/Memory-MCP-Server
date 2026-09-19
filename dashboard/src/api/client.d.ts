export declare const api: {
    login: (email: string, password: string) => Promise<any>;
    register: (email: string, password: string, name?: string) => Promise<any>;
    getStats: () => Promise<any>;
    getUsers: () => Promise<any>;
    createUser: (data: any) => Promise<any>;
    updateUser: (id: string, data: any) => Promise<any>;
    deleteUser: (id: string) => Promise<any>;
    getMemories: (params?: Record<string, string>) => Promise<any>;
    getProjects: () => Promise<any>;
    getApiKeys: () => Promise<any>;
    getWorkspaces: () => Promise<any>;
};
