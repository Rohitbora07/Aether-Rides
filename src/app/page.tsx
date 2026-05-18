import PublicHome from "@/features/home/components/PublicHome";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import { auth } from "@/lib/auth";
import AdminDashBoard from "@/features/home/components/AdminDashBoard";
import PartnerDashBoard from "@/features/home/components/PartnerDashBoard";


export default async function Home() {
  const session = await auth()
  console.log(session?.user.role)
  return (
    <div className=" w-full min-h-screen bg-white ">
      {
        session?.user?.role === "admin" ? <AdminDashBoard /> :
          session?.user?.role === "partner" ? <><Nav /><PartnerDashBoard /></> :
            <><Nav /><PublicHome /></>
      }

      <Footer />
    </div>
  );
}
