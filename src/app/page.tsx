import PublicHome from "@/components/home/PublicHome";
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
