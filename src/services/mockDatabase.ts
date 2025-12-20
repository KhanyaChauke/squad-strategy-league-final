import { User } from '@/contexts/AuthContext';

const USERS_KEY = 'fpsl_users';
const CURRENT_USER_KEY = 'fpsl_current_user';

interface StoredUser extends User {
    password?: string;
}

export class MockDatabase {
    private getUsers(): StoredUser[] {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    }

    private saveUsers(users: StoredUser[]) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = this.getUsers();
        // In a real app, we'd hash passwords. For this mock, we'll just check if the user exists
        // and assume the password is correct if the user exists (simplification for mock)
        // OR we can store a "password" field in the user object for slightly better realism
        // but the User interface doesn't have a password field. 
        // Let's just check email for now as the interface is limited.

        // Actually, let's extend the stored data to include password, even if the returned User type doesn't have it.
        const storedUser = users.find((u) => u.email === email && u.password === password);

        if (storedUser) {
            const { password: _, ...userWithoutPassword } = storedUser;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
            return { user: userWithoutPassword, error: null };
        }

        return { user: null, error: 'Invalid email or password' };
    }

    async signUp(fullName: string, email: string, password: string): Promise<{ user: User | null; error: string | null }> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const users = this.getUsers();
        if (users.some(u => u.email === email)) {
            return { user: null, error: 'User already exists' };
        }

        const newUser: StoredUser = {
            id: crypto.randomUUID(),
            fullName,
            email,
            password, // Storing password in local storage for mock auth
            budget: 1000000000,
            squad: [],
            bench: [],
            emailVerified: true, // Auto-verify for local mock
            teamName: undefined
        };

        users.push(newUser);
        this.saveUsers(users);

        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

        return { user: userWithoutPassword, error: null };
    }

    async signOut(): Promise<void> {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    async getCurrentUser(): Promise<User | null> {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }

    async updateUser(user: User): Promise<void> {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);

        if (index !== -1) {
            // Preserve the password
            const existingUser = users[index];
            users[index] = { ...user, password: existingUser.password };
            this.saveUsers(users);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        }
    }
}

export const mockDb = new MockDatabase();
