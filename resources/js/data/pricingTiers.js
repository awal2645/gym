/** Helpers for displaying plan prices and checkout/pricing UI from API plan objects. */

/** USD price with $ before the amount (e.g. $29 or $29.99). */
export function formatUsdPrice(value) {
    const n = Number(value);
    if (Number.isNaN(n)) {
        return '$0';
    }
    const s = n % 1 === 0 ? String(Math.round(n)) : n.toFixed(2);
    return `$${s}`;
}

/**
 * Display shape for pricing / checkout cards from a plan row (DB: name, features, best_value).
 */
export function planPricingDisplay(plan) {
    if (!plan) {
        return null;
    }
    return {
        title: plan.name,
        lines: Array.isArray(plan.features) ? plan.features : [],
        isFeatured: !!plan.best_value,
    };
}
