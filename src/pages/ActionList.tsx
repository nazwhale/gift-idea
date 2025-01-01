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
  isBought,
  onMarkAsBought,
  onDelete,
}: {
  ideaId: string;
  isBought: boolean;
  onMarkAsBought: (ideaId: string) => void;
  onDelete: (ideaId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isBought && (
          <DropdownMenuItem onClick={() => onMarkAsBought(ideaId)}>
            Mark as bought
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDelete(ideaId)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
