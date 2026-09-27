export type DashboardPayload = {
  message: string;
  user: {
    name: string;
    email: string;
    phone: string;
    role: "customer" | "admin";
    emailVerified: boolean;
    isAdmin: boolean;
  };
};

export default interface IDashboardService {
  show(): Promise<DashboardPayload>;
}
