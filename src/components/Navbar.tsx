import { Button } from "../components/ui/button";
import { handleLogout } from "../lib/logout";

export default function Navbar({ isLoggedOut }) {
  return (
    <nav className="p-4 flex justify-between items-center bg-[#e0daff]">
      <h1 className="text-lg font-bold">
        <a href="/">Gift GOATs</a>
      </h1>
      {!isLoggedOut && (
        <Button
          variant="ghost"
          className="text-gray-500"
          onClick={handleLogout}
        >
          Logout
        </Button>
      )}
    </nav>
  );
}
