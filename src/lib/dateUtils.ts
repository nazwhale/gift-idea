import { Giftee } from "@/types";

/**
 * Calculate the number of days until Christmas
 */
export function calculateDaysToChristmas(): number {
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

/**
 * Find giftees with birthdays in the next N days
 */
export function birthdaysInNextNDays(giftees: Giftee[], n: number): Giftee[] {
    const today = new Date();
    const nextNDays = new Date();
    nextNDays.setDate(today.getDate() + n);

    return giftees
        .filter((g) => {
            const dob = new Date(g.date_of_birth || "");
            dob.setFullYear(today.getFullYear());
            return dob >= today && dob <= nextNDays;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date_of_birth || "");
            const dateB = new Date(b.date_of_birth || "");
            dateA.setFullYear(today.getFullYear());
            dateB.setFullYear(today.getFullYear());
            return dateA.getTime() - dateB.getTime();
        });
} 