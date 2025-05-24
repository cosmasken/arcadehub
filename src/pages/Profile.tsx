
import UserProfile from "@/components/profile/UserProfile";

const Profile = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow pt-16 pb-16">
        <UserProfile />
      </main>
    </div>
  );
};

export default Profile;
