export function getRelativeTimeString(date: Date | undefined): string | undefined {
    if (date === undefined) {
        return undefined;
    }
    const now = new Date();
    const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);
    const lastWeekStart = new Date(today);
    lastWeekStart.setUTCDate(today.getUTCDate() - 7);
    const thisMonthStart = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);

    if (date >= today) {
        return "Today";
    } else if (date >= yesterday) {
        return "Yesterday";
    } else if (date >= lastWeekStart) {
        return "Last 7 days";
    } else if (date >= thisMonthStart) {
        return "This month";
    } else {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    }
}
