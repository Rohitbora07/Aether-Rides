import PublicHome from "@/features/home/components/PublicHome";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";


export default function Home() {
  return (
    <div className=" w-full min-h-screen bg-white ">
      <Nav />
      <PublicHome />
      <Footer />
    </div>
  );
}
