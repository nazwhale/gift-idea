// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export default function Dashboard() {
  const [giftees, setGiftees] = useState<any[]>([]);
  const [newGifteeName, setNewGifteeName] = useState("");

  useEffect(() => {
    getGiftees().then(setGiftees).catch(console.error);
  }, []);

  const handleAddGiftee = async () => {
    const giftee = await addGiftee(newGifteeName);
    setGiftees([...giftees, giftee]);
    setNewGifteeName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    if (newGifteeName.trim()) {
      handleAddGiftee(); // Trigger the add giftee function
    }
  };

  const daysToChristmas = calculateDaysToChristmas();
  const birthdays = birthdaysInNextNDays(giftees, 14);
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
        <div>
          🎄 <strong>{daysToChristmas}</strong> day
          {daysToChristmas === 1 ? "" : "s"} til Christmas
        </div>
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
          <Giftee g={g} keyprefix="christmas" />
        ))}
      </ul>

      <div>---</div>

      <h3>All people</h3>
      <ul>
        {giftees.map((g) => (
          <Giftee g={g} keyprefix="all" />
        ))}
      </ul>
    </div>
  );
}

function Giftee({ g, keyprefix }) {
  return (
    <li key={keyprefix + g.id}>
      <a href={`/giftee/${g.id}`} className="text-blue-600 underline">
        {g.name}
      </a>{" "}
      <span className="text-gray-400">
        -
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {g.ideas.filter((i) => i.purchased_at != null).length} bought
            </TooltipTrigger>
            <TooltipContent className="bg-white">
              {g.ideas.map((i) => {
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
              , {g.ideas.filter((i) => i.purchased_at == null).length} idea
              {g.ideas.filter((i) => i.purchased_at == null).length === 1
                ? ""
                : "s"}{" "}
            </TooltipTrigger>
            <TooltipContent className="bg-white">
              {g.ideas.map((i) => {
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
      {g.on_christmas && (
        <Badge variant="outline" className="ml-2">
          Christmas
        </Badge>
      )}
      {g.on_birthday && (
        <Badge variant="outline" className="ml-2">
          Birthday
        </Badge>
      )}
    </li>
  );
}

/**
 * Calculate days to Christmas
 * @returns {number} Number of days until the next Christmas
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

function getChristmasGiftees(giftees: any[]): any[] {
  const filtered = giftees.filter((g) => g.on_christmas);
  // order by 0 gifts bought first
  const sorted = filtered.sort((a, b) => {
    return (
      a.ideas.filter((i) => i.purchased_at != null).length -
      b.ideas.filter((i) => i.purchased_at != null).length
    );
  });
  return sorted;
}

function birthdaysInNextNDays(giftees: any[], n: number): any[] {
  // Ignore year, just compare month and day
  const today = new Date();
  const nextNDays = new Date();
  nextNDays.setDate(today.getDate() + n);

  return giftees.filter((g) => {
    const dob = new Date(g.date_of_birth);
    dob.setFullYear(today.getFullYear());
    return dob >= today && dob <= nextNDays;
  });
}
