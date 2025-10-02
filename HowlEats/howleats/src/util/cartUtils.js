export const calculateCartTotals = (cartItems, quantities) => {

    // Calculations
    const subtotal = cartItems.reduce((acc, food) => {
        const count = quantities?.[food.id] ?? 0;
        return acc + food.price * count;
    }, 0);
    const shipping = subtotal === 0 ? 0.0 : 1;
    const tax = subtotal * 0.1; // 10 % tax 
    const total = subtotal + shipping + tax;

    return {subtotal, shipping, tax, total};
}