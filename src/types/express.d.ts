export {}; // 👈 required

global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User {
            id: number;
            email: string;
            role: string;
            name: string;
            companyId: number;
        }

        interface Request {
            user?: User | undefined;
        }
    }
}