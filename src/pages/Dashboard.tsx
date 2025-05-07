import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { GIFTEE_EVENTS, PAGE_VIEWED, PAGES, captureEvent } from "../lib/posthog";

import { Giftee } from "@/types";
import GifteeRow from "./GifteeRow";
import { useToast } from "@/hooks/use-toast";

import ResponsiveIdeasDialog from "@/components/ResponsiveIdeasDialog";
import { calculateDaysToChristmas } from "@/lib/dateUtils";

export default function Dashboard() {
  const { toast } = useToast();
  const [giftees, setGiftees] = useState<Giftee[]>([]);
  const [newGifteeName, setNewGifteeName] = useState("");
  const [newGiftee, setNewGiftee] = useState<Giftee | null>(null);
  const [isIdeasDialogOpen, setIsIdeasDialogOpen] = useState(false);

  useEffect(() => {
    captureEvent(PAGE_VIEWED, {
      page: PAGES.DASHBOARD
    });

    // Load giftees
    getGiftees()
      .then((data) => {
        // We need to manually type it due to type mismatch
        const gifteeData = data as unknown;
        setGiftees(gifteeData as Giftee[]);
      })
      .catch((err) => {
        console.error(err);
        setGiftees([]);
      });
  }, []);

  const handleAddGiftee = async () => {
    const giftee = await addGiftee(newGifteeName);
    setGiftees((prev) => [...prev, giftee]);
    setNewGifteeName("");
    setNewGiftee(giftee);
    setIsIdeasDialogOpen(true);

    captureEvent(GIFTEE_EVENTS.GIFTEE_ADDED, {
      giftee_id: giftee.id,
      giftee_name: giftee.name
    });

    toast({
      title: "Person Added",
      description: `${giftee.name} has been successfully added.`,
    });
  };

  const handleDetailsUpdate = (updated: boolean, updatedGiftee?: Giftee) => {
    if (updated && updatedGiftee && newGiftee) {
      setGiftees((prev) =>
        prev.map((g) => (g.id === updatedGiftee.id ? updatedGiftee : g))
      );
    }
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newGifteeName.trim()) {
      handleAddGiftee();
    }
  };

  const sortedGiftees = [...giftees].sort((a, b) => {
    const today = new Date();
    const dateA = new Date(a.date_of_birth || "");
    const dateB = new Date(b.date_of_birth || "");

    // Set both dates to current year
    dateA.setFullYear(today.getFullYear());
    dateB.setFullYear(today.getFullYear());

    // If the birthday has already passed this year, set it to next year
    if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
    if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);

    return dateA.getTime() - dateB.getTime();
  });

  const daysToChristmas = calculateDaysToChristmas();

  return (
    <div className="py-4">
      <div className="mb-4">
        <Link to="/ideas" className="text-sm text-primary underline">
          All ideas
        </Link>
      </div>

      {/* Only show Christmas countdown */}
      <div className="text-gray-500 mb-4">
        {daysToChristmas < 51 && (
          <div>
            🎄 <strong>{daysToChristmas}</strong> day
            {daysToChristmas === 1 ? "" : "s"} til Christmas
          </div>
        )}
      </div>

      <h1 className="text-xl mb-4">Your People</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <Input
          placeholder="Their name"
          value={newGifteeName}
          onChange={(e) => setNewGifteeName(e.target.value)}
        />
        <Button type="submit" variant="outline" data-testid="add-person-button">
          Add person
        </Button>
      </form>

      {/* ResponsiveIdeasDialog with details tab for newly added giftee */}
      {newGiftee && (
        <ResponsiveIdeasDialog
          giftee={newGiftee}
          ideas={newGiftee.ideas || []}
          open={isIdeasDialogOpen}
          setOpen={setIsIdeasDialogOpen}
          onToggleBought={async () => { }}
          onDelete={async () => { }}
          onAddIdea={async () => { }}
          onDetailsUpdate={handleDetailsUpdate}
          initialTab="details"
        />
      )}

      <ul>
        {sortedGiftees.map((g) => {
          const today = new Date();
          const birthday = new Date(g.date_of_birth || "");
          birthday.setFullYear(today.getFullYear());

          // If birthday has passed this year, set to next year
          if (birthday < today) {
            birthday.setFullYear(today.getFullYear() + 1);
          }

          const daysUntil = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const showBirthday = daysUntil <= 31;

          return (
            <li key={g.id} className="flex justify-between items-center py-2">
              <div>
                {g.name}
                {showBirthday && (
                  <span className="text-gray-500 ml-2">
                    - 🎂 {daysUntil} day{daysUntil === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <GifteeRow g={g} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

