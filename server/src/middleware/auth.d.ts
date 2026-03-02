import type { Request } from 'express';
export interface AuthRequest extends Request {
    user: {
        userId: string;
        role: string;
        companyId: string;
    } | undefined;
}
//# sourceMappingURL=auth.d.ts.map