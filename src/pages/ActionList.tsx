import { Button } from "../components/ui/button";

// Import these from Shadcn UI or your local dropdown menu component.
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react"; // A common 3-dot icon

export default function ActionList({
  ideaId,
  ideaName,
  isBought,
  onToggleBought,
  onDelete,
  onEditUrl,
  url = null,
}: {
  ideaId: string;
  ideaName: string;
  isBought: boolean;
  onToggleBought: (ideaId: string) => void;
  onDelete: (ideaId: string) => void;
  onEditUrl: (ideaId: string, currentUrl: string | null) => void;
  url?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid={`action-menu-${ideaId}`}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isBought && (
          <DropdownMenuItem onClick={() => onToggleBought(ideaId)}>
            Mark as bought
          </DropdownMenuItem>
        )}
        {isBought && (
          <DropdownMenuItem onClick={() => onToggleBought(ideaId)}>
            Mark as not bought
          </DropdownMenuItem>
        )}
        {/* URL Action */}
        <DropdownMenuItem onClick={() => onEditUrl(ideaId, url)} data-testid={`edit-url-${ideaId}`}>
          {url ? "Edit Link" : "Add Link"}
        </DropdownMenuItem>
        {/* "Search Amazon" Button */}
        <DropdownMenuItem
          onClick={() =>
            window.open(
              generateAmazonSearchUrl(ideaName),
              "_blank",
              "noopener,noreferrer"
            )
          }
        >
          Search Amazon
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(ideaId)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Generate Amazon search link with Associate ID
export const generateAmazonSearchUrl = (searchQuery: string): string => {
  const baseUrl = "https://www.amazon.co.uk/s";
  const queryParams = new URLSearchParams({
    k: searchQuery,
    tag: "giftgoats-21", // Your Associate ID
  });
  return `${baseUrl}?${queryParams.toString()}`;
};
