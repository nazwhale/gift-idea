import { useEffect, useState } from "react";
import { getGiftees, addGiftee, updateGiftee } from "../lib/giftees";
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

  const daysToChristmas = calculateDaysToChristmas();
  const birthdays = birthdaysInNextNDays(giftees, 21);

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/ideas" className="text-sm text-primary underline">
          All ideas
        </Link>
      </div>

      {/* Upcoming Birthdays and Christmas */}
      <div className="text-gray-500 mb-4">
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
                      new Date().getFullYear()
                    ) -
                      new Date().getTime()) /
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
        {getChristmasGiftees(giftees).map((g) => (
          <GifteeRow key={g.id} g={g} />
        ))}
      </ul>

      <div className="text-gray-300">---</div>

      <h3>All people</h3>
      <ul>
        {giftees.map((g) => (
          <GifteeRow key={g.id} g={g} />
        ))}
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

  return giftees.filter((g) => {
    const dob = new Date(g.date_of_birth);
    dob.setFullYear(today.getFullYear());
    return dob >= today && dob <= nextNDays;
  });
}

function getChristmasGiftees(giftees: Giftee[]): Giftee[] {
  return giftees.filter((g) => g.on_christmas);
}
