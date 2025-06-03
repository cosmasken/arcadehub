import { useState } from "react";
import useProfileStore from "../stores/useProfileStore";
import useWalletStore from "../stores/useWalletStore";
import supabase from "../hooks/use-supabase";

const Onboarding = () => {
  const { setUsername, setBio, setAvatar } = useProfileStore();
  const [role, setRoleLocal] = useState<"gamer" | "developer">("gamer");
  const [username, setUsernameLocal] = useState("");
  const [bio, setBioLocal] = useState("");
  const [avatar, setAvatarLocal] = useState("");
  const { address } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setRole(role);
    setUsername(username);
    setBio(bio);
    setAvatar(avatar);
     // Persist to Supabase
    if (address) {
      await supabase.from("profiles").upsert([
        {
          wallet_address: address,
          username,
          bio,
          avatar,
          role,
        },
      ]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Setup Your Account</h2>
      <label className="block mb-2">
        Role:
        <select value={role} onChange={e => setRoleLocal(e.target.value as "gamer" | "developer")} className="ml-2">
          <option value="gamer">Gamer</option>
          <option value="developer">Developer</option>
        </select>
      </label>
      <label className="block mb-2">
        Username:
        <input value={username} onChange={e => setUsernameLocal(e.target.value)} className="ml-2 border" required />
      </label>
      <label className="block mb-2">
        Bio:
        <input value={bio} onChange={e => setBioLocal(e.target.value)} className="ml-2 border" required />
      </label>
      <label className="block mb-2">
        Avatar URL:
        <input value={avatar} onChange={e => setAvatarLocal(e.target.value)} className="ml-2 border" />
      </label>
      {role === "developer" && (
        <div>
          {/* Add developer-specific fields here */}
        </div>
      )}
      <button type="submit" className="mt-4 bg-purple-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
};

export default Onboarding;