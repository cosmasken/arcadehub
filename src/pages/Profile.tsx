
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UserProfile from "@/components/profile/UserProfile";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow pt-16 pb-16">
        <UserProfile />
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
