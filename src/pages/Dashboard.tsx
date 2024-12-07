// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { getGiftees, addGiftee } from "../lib/giftees";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

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

  return (
    <div className="p-4">
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