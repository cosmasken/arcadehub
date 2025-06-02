
import useProfileStore from "../stores/useProfileStore";
import DeveloperProfile from "../components/profile/DeveloperProfile";
import GamerProfile from "../components/profile/GamerProfile";

const Profile = () => {
  const { role } = useProfileStore();
  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      <main className="flex-grow">
         {role === "developer" ? <DeveloperProfile /> : <GamerProfile />}
      </main>
    </div>
  );
};

export default Profile;
