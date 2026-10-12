export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  emailVerified: boolean;
  createdAt: Date;
};

export default interface IUserAdminService {
  list(): Promise<AdminUserListItem[]>;
}
