import { Button } from "../components/ui/button";
import { handleLogout } from "../lib/logout";

export default function Navbar({ isLoggedOut }) {
  return (
    <nav className="p-4 flex justify-between items-center bg-[#e0daff]">
      <h1 className="text-lg font-bold">Gift Ideas</h1>
      {!isLoggedOut && (
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      )}
    </nav>
  );
}
