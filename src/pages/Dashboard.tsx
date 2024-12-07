// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Separator } from "@/components/ui/separator.tsx";

const christmas = new Date("2021-12-25");

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

  return (
    <div className="p-4">
      {/* Days to Christmas */}
      <div className="text-gray-600 mb-4">
        🎄 <strong>{daysToChristmas}</strong> day
        {daysToChristmas === 1 ? "" : "s"} until Christmas! 🎅
      </div>

      <h1 className="text-xl mb-4">Your Giftees</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex space-x-2">
        <Input
          placeholder="Giftee name"
          value={newGifteeName}
          onChange={(e) => setNewGifteeName(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Add Giftee
        </Button>
      </form>
      <ul>
        {giftees.map((g) => (
          <li key={g.id}>
            <a href={`/giftee/${g.id}`} className="text-blue-600 underline">
              {g.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
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
