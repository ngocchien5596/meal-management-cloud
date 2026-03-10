
import prisma from './lib/prisma';

async function debug() {
    console.log('--- SERVER DEBUG ---');
    console.log('System Local Time:', new Date().toString());
    console.log('System UTC Time:', new Date().toISOString());

    const vnTimeStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    console.log('Vietnam Time String (en-US):', vnTimeStr);

    const nowVN = new Date(vnTimeStr);
    console.log('Parsed nowVN object:', nowVN.toString());
    console.log('Parsed nowVN (getHours):', nowVN.getHours());
    console.log('Parsed nowVN (getMinutes):', nowVN.getMinutes());

    const config = await prisma.systemConfig.findUnique({
        where: { key: 'CUT_OFF_HOUR' }
    });
    console.log('DB Config CUT_OFF_HOUR:', config?.value);

    // Tomorrow for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const mealDate = tomorrow;

    const cutoffTime = config?.value || '16';

    // Normalize today in VN to 00:00
    const today = new Date(nowVN.getFullYear(), nowVN.getMonth(), nowVN.getDate());
    const targetDate = new Date(mealDate.getFullYear(), mealDate.getMonth(), mealDate.getDate());

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    console.log('Target Meal Date:', mealDate.toISOString());
    console.log('diffDays:', diffDays);

    let canMod = true;
    if (diffDays < 1) canMod = false;
    else if (diffDays === 1) {
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

        console.log(`Comparing: Current VN Time ${currentHour}:${currentMinute} vs Cutoff ${cutoffHour}:${cutoffMinute}`);

        if (currentHour < cutoffHour) canMod = true;
        else if (currentHour === cutoffHour) canMod = currentMinute < cutoffMinute;
        else canMod = false;
    }

    console.log('Final canMod result:', canMod);
    process.exit(0);
}

debug().catch(err => {
    console.error(err);
    process.exit(1);
});
