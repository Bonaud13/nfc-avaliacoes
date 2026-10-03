import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "PPRT Control",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminShell />;
}
