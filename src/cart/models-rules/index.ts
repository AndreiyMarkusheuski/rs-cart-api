import { Cart, CartItem } from '../models';

/**
 * @param {Cart} cart
 * @returns {number}
 */

const ITEM_PRICE = 1;
export function calculateCartTotal(cart: Cart): number {
    return cart?.items
        ? cart.items.reduce(
            (acc: number, { count }: CartItem) => {
                return (acc += ITEM_PRICE * count);
            },
            0,
        )
        : 0;
}
