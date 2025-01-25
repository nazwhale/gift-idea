import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

import { Giftee } from "@/types";
import GifteeRow from "./GifteeRow";
import { useToast } from "@/hooks/use-toast";

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

  const sortedGiftees = [...giftees].sort((a, b) => {
    const today = new Date();
    const dateA = new Date(a.date_of_birth);
    const dateB = new Date(b.date_of_birth);
    
    // Set both dates to current year
    dateA.setFullYear(today.getFullYear());
    dateB.setFullYear(today.getFullYear());
    
    // If the birthday has already passed this year, set it to next year
    if (dateA < today) dateA.setFullYear(today.getFullYear() + 1);
    if (dateB < today) dateB.setFullYear(today.getFullYear() + 1);
    
    return dateA.getTime() - dateB.getTime();
  });

  const daysToChristmas = calculateDaysToChristmas();
  const birthdays = birthdaysInNextNDays(giftees, 21);

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
        <Button type="submit" variant="outline">
          Add person
        </Button>
      </form>

      <ul>
        {sortedGiftees.map((g) => {
          const today = new Date();
          const birthday = new Date(g.date_of_birth);
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
              <GifteeRow g={g}  />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Helper functions for upcoming birthdays and Christmas giftees
 */
function calculateDaysToChristmas(): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const christmas = new Date(`${currentYear}-12-25`);
  const timeDiff = christmas.getTime() - today.getTime();

  if (timeDiff < 0) {
    const nextChristmas = new Date(`${currentYear + 1}-12-25`);
    return Math.ceil(
      (nextChristmas.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function birthdaysInNextNDays(giftees: Giftee[], n: number): Giftee[] {
  const today = new Date();
  const nextNDays = new Date();
  nextNDays.setDate(today.getDate() + n);

  return giftees
    .filter((g) => {
      const dob = new Date(g.date_of_birth);
      dob.setFullYear(today.getFullYear());
      return dob >= today && dob <= nextNDays;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date_of_birth);
      const dateB = new Date(b.date_of_birth);
      dateA.setFullYear(today.getFullYear());
      dateB.setFullYear(today.getFullYear());
      return dateA.getTime() - dateB.getTime();
    });
}

function getChristmasGiftees(giftees: Giftee[]): Giftee[] {
  return giftees.filter((g) => g.on_christmas);
}
