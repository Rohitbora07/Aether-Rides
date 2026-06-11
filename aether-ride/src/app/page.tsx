import PublicHome from "@/features/landing/components/PublicHome";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";
import { auth } from "@/lib/auth";
import AdminDashBoard from "@/features/admin/components/AdminDashBoard";
import PartnerDashBoard from "@/features/partner/components/PartnerDashBoard";
import GeoUpdater from "@/utils/GeoUpdater";

export default async function Home() {
  const session = await auth()
  console.log(session?.user.role)
  return (
    <div className=" w-full min-h-screen bg-white ">
      <GeoUpdater userId = {session?.user?.id as string}  />
      {
        session?.user?.role === "admin" ? <AdminDashBoard /> :
          session?.user?.role === "partner" ? <><Nav /><PartnerDashBoard /></> :
            <><Nav /><PublicHome /></>
      }

      <Footer />
    </div>
  );
}
