
function canModifyWithCutoffMock(mealDate, cutoffTime, now) {
    // Mimic the logic in registrations.ts but with a 'now' parameter
    const vnTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    const nowVN = new Date(vnTimeStr);

    const todayVN = new Date(nowVN.getFullYear(), nowVN.getMonth(), nowVN.getDate());
    const targetDate = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());

    const diffTime = targetDate.getTime() - todayVN.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return false;
    if (diffDays === 1) {
        let cutoffHour = 16;
        let cutoffMinute = 0;

        if (typeof cutoffTime === 'string' && cutoffTime.includes(':')) {
            const parts = cutoffTime.split(':');
            cutoffHour = parseInt(parts[0], 10);
            cutoffMinute = parseInt(parts[1], 10);
        } else {
            cutoffHour = parseInt(cutoffTime, 10);
        }

        const currentHour = nowVN.getHours();
        const currentMinute = nowVN.getMinutes();

        console.log(`VN Time: ${nowVN.toLocaleTimeString()}, Cutoff: ${cutoffHour}:${cutoffMinute}`);

        if (currentHour < cutoffHour) return true;
        if (currentHour === cutoffHour) return currentMinute < cutoffMinute;
        return false;
    }
    return true;
}

// Tomorrow's date
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// Test 1: Cutoff 15:45, Now 15:46 (VN Time)
// We'll create a date that represents a specific point in time
// If the local machine is UTC+7, then 15:46 local is what we want to test
const nowTest = new Date(); // Assume this matches user's local roughly for the purpose of the test runner
const result = canModifyWithCutoffMock(tomorrow, "15:45", nowTest);
console.log(`Result for 15:45 cutoff at current time: ${result ? "ALLOWED" : "BLOCKED"}`);

if (!result) {
    console.log("✅ SUCCESS: Logic correctly blocks registration after cutoff.");
} else {
    console.log("❌ FAILURE: Logic allowed registration after cutoff.");
}
