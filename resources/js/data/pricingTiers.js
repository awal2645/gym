/** Shared: static tier copy + helpers. Prices & plan ids always come from the API. */

export const STATIC_TIERS = [
    {
        title: 'Quick Fix',
        lines: [
            'Pay-as-you-go • No commitment',
            'Perfect for fixing 2 or 3 lifts.',
            'Up to 3 exercise videos',
            'Written feedback',
            'Clear form corrections',
            'Key cues & fixes',
            '48-hour turnaround',
            '👉 Best for: Quick answers when something feels off',
        ],
    },
    {
        title: 'Form Builder Elite 🏆',
        lines: [
            'Perfect for creating consistent progress & better training over time',
            'Up to 12 exercise videos/month',
            '🎥 Personalized video feedback',
            'Ongoing coaching & guidance',
            'Technique & movement improvement',
            'Priority response',
            '24–36 hour turnaround',
            "👉 I don't just fix your form, I improve how you train.",
        ],
    },
    {
        title: 'Advanced Form Mastery 💎',
        lines: [
            'Best for dialing everything in and training at a high level',
            'Up to 20 exercise videos/month',
            '🎥 Advanced video breakdowns',
            '⚡ Same/next-day response',
            'Injury prevention focus',
            'Efficiency & movement optimization',
            'Exercise selection guidance',
            '👉 I refine how your body moves—not just how the exercise looks.',
        ],
    },
];

export function priceDollarSuffix(value) {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return '0$';
    }
    const s = n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
    return `${s}$`;
}

export function oldPriceForDiscount20(price) {
    const n = Number(price);
    if (Number.isNaN(n) || n <= 0) {
        return null;
    }
    const raw = n / 0.8;
    const rounded = Math.round(raw * 100) / 100;
    return priceDollarSuffix(rounded);
}

export function mergeStaticTiersWithPlans(apiPlans) {
    if (!apiPlans?.length || apiPlans.length !== STATIC_TIERS.length) {
        return null;
    }
    const sorted = [...apiPlans].sort((a, b) => Number(a.price) - Number(b.price));
    return STATIC_TIERS.map((tier, index) => ({
        ...tier,
        plan: sorted[index],
    }));
}

/**
 * Which static tier matches this plan? Same rule as pricing: sort all plans by price, match by index.
 */
export function getStaticTierForPlan(currentPlan, allPlans) {
    if (!currentPlan || !allPlans?.length || allPlans.length !== STATIC_TIERS.length) {
        return null;
    }
    const sorted = [...allPlans].sort((a, b) => Number(a.price) - Number(b.price));
    const idx = sorted.findIndex((p) => Number(p.id) === Number(currentPlan.id));
    if (idx === -1) {
        return null;
    }
    return {
        title: STATIC_TIERS[idx].title,
        lines: STATIC_TIERS[idx].lines,
        tierIndex: idx,
        isFeatured: idx === 1,
    };
}
