export interface User {
  id: number;
  email: string;
  role: 'admin' | 'employee';
  companyId: number;
}
