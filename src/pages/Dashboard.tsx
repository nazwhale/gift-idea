import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Giftee } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addIdea, updateIdea, deleteIdea } from "@/lib/ideas";
import { useToast } from "@/hooks/use-toast"; // Import toast hook

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

const daysInFuture = 21;

export default function Dashboard() {
  const { toast } = useToast();
  const [giftees, setGiftees] = useState<Giftee[]>([]);
  const [newGifteeName, setNewGifteeName] = useState("");

  useEffect(() => {
    getGiftees().then(setGiftees).catch(console.error);
  }, []);

  const handleAddGiftee = async () => {
    const giftee = await addGiftee(newGifteeName);
    setGiftees((prev) => [...prev, giftee]);
    setNewGifteeName("");
    toast({
      title: "Person Added",
      description: `${giftee.name} has been successfully added.`,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newGifteeName.trim()) {
      handleAddGiftee();
    }
  };

  const daysToChristmas = calculateDaysToChristmas();
  const birthdays = birthdaysInNextNDays(giftees, daysInFuture);
  const today = new Date();
  const christmasGiftees = getChristmasGiftees(giftees);

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/ideas" className="text-sm text-primary underline">
          All ideas
        </Link>
      </div>
      {/* Days to Christmas */}
      <div className="text-gray-500 mb-4">
        {/*If Christmas is a long time away, don't show*/}
        {daysToChristmas < 51 && (
          <div>
            🎄 <strong>{daysToChristmas}</strong> day
            {daysToChristmas === 1 ? "" : "s"} til Christmas
          </div>
        )}
        <div>
          <ul>
            {birthdays.map((g) => (
              <li key={"birthdays" + g.id}>
                🍰{" "}
                <strong>
                  {Math.ceil(
                    (new Date(g.date_of_birth).setFullYear(
                      today.getFullYear()
                    ) -
                      today.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                </strong>
                days til {g.name}'s birthday
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h1 className="text-xl mb-4">Your People</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <Input
          placeholder="Their name"
          value={newGifteeName}
          onChange={(e) => setNewGifteeName(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Add person
        </Button>
      </form>

      <h3>Christmas '24</h3>
      <ul>
        {christmasGiftees.map((g) => (
          <GifteeRow g={g} key={"christmas" + g.id} />
        ))}
      </ul>

      <div className="text-gray-300">---</div>

      <h3>All people</h3>
      <ul>
        {giftees.map((g) => (
          <GifteeRow g={g} key={"all" + g.id} />
        ))}
      </ul>
    </div>
  );
}

type GifteeProps = {
  g: Giftee;
};

function GifteeRow({ g }: GifteeProps) {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState(g.ideas || []);

  // For new idea creation
  const [ideaName, setIdeaName] = useState("");

  // Dialog state to open/close the modal that lists ideas
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle adding a new idea (small form in the modal)
  const handleAddIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!g.id) return;

    const newIdea = await addIdea(g.id, ideaName);
    setIdeas((prev) => [...prev, newIdea]);
    setIdeaName("");
    toast({
      title: "Idea Added",
      description: `${newIdea.name} added for ${g.name}.`,
    });
  };

  // Demo function to mark an idea as purchased
  const handleMarkAsBought = async (ideaId: string) => {
    // For example:
    const purchasedAt = new Date();
    const updated = await updateIdea(ideaId, { purchased_at: purchasedAt });
    setIdeas((prev) => prev.map((i) => (i.id === ideaId ? updated : i)));
    toast({
      title: "Marked as Bought",
      description: `Idea purchased.`,
    });
  };

  // Demo function to delete an idea
  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdea(ideaId);
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    toast({
      title: "Idea Deleted",
      description: `Idea removed.`,
    });
  };

  return (
    <li>
      <a href={`/giftee/${g.id}`} className="text-blue-600 underline">
        {g.name}
      </a>{" "}
      <span className="text-gray-400">
        -{" "}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {ideas.filter((i) => i.purchased_at != null).length} bought
            </TooltipTrigger>
            <TooltipContent className="bg-white">
              {ideas.map((i) => {
                if (i.purchased_at != null) {
                  return (
                    <div key={i.id}>
                      <a
                        href={i.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {i.name}
                      </a>
                    </div>
                  );
                }
                return null;
              })}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              , {ideas.filter((i) => i.purchased_at == null).length} idea
              {ideas.filter((i) => i.purchased_at == null).length === 1
                ? ""
                : "s"}{" "}
            </TooltipTrigger>
            <TooltipContent className="bg-white">
              {ideas.map((i) => {
                if (i.purchased_at == null) {
                  return (
                    <div key={i.id}>
                      <a
                        href={i.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {i.name}
                      </a>
                    </div>
                  );
                }
                return null;
              })}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
      {/* Button to Open the "Ideas" Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="px-2 ml-2 text-blue-500"
            onClick={() => setIsDialogOpen(true)}
          >
            View Ideas
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{g.name}'s Ideas</DialogTitle>
          </DialogHeader>

          {/* List existing ideas in the modal */}
          {ideas.length > 0 ? (
            <ul className="space-y-2 mb-4 overflow-y-scroll max-h-96">
              {ideas.map((idea) => (
                <li
                  key={idea.id}
                  className="flex items-center justify-between border-b p-2 rounded"
                >
                  <div>
                    <p>{idea.name}</p>
                    {idea.purchased_at && (
                      <span className="ml-2 text-sm text-green-600">
                        (bought)
                      </span>
                    )}
                  </div>

                  {/* 3-dot Icon Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {!idea.purchased_at && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleMarkAsBought(idea.id)}
                        >
                          Mark as bought
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleDeleteIdea(idea.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No ideas yet.</p>
          )}

          {/* Add new idea form */}
          <form onSubmit={handleAddIdea} className="flex space-x-2">
            <Input
              placeholder="Add new idea"
              value={ideaName}
              onChange={(e) => setIdeaName(e.target.value)}
            />
            <Button type="submit">Add</Button>
          </form>
        </DialogContent>
      </Dialog>
    </li>
  );
}

/**
 * Calculate days to Christmas
 */
function calculateDaysToChristmas(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const christmas = new Date(`${currentYear}-12-25`);
  const timeDiff = christmas.getTime() - today.getTime();

  // If Christmas is in the past, calculate for next year
  if (timeDiff < 0) {
    const nextChristmas = new Date(`${currentYear + 1}-12-25`);
    return Math.ceil(
      (nextChristmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function getChristmasGiftees(giftees: Giftee[]): Giftee[] {
  const filtered = giftees.filter((g) => g.on_christmas);
  // Sort by purchased count
  return filtered.sort((a, b) => {
    return (
      a.ideas.filter((i) => i.purchased_at != null).length -
      b.ideas.filter((i) => i.purchased_at != null).length
    );
  });
}

function birthdaysInNextNDays(giftees: Giftee[], n: number): Giftee[] {
  const today = new Date();
  const nextNDays = new Date();
  nextNDays.setDate(today.getDate() + n);

  return giftees.filter((g) => {
    const dob = new Date(g.date_of_birth);
    // Compare only mm/dd in the current year
    dob.setFullYear(today.getFullYear());
    return dob >= today && dob <= nextNDays;
  });
}
