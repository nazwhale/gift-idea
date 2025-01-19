import { Button } from "../components/ui/button";
import { handleLogout } from "../lib/logout";
import logo from "/logo6.png";

export default function Navbar({ isLoggedOut }) {
  return (
    <nav className="flex justify-between items-center">
      <div className="flex items-center space-x-2 w-full">
        <img src={logo} alt="Logo" className="size-8" /> {/* Logo image */}
        <h1 className="text-lg font-semibold text-[#081922]">
          <a href="/">giftgoats</a>
        </h1>
      </div>
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
