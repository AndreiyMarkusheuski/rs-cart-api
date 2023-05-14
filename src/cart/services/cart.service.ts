import { Injectable } from '@nestjs/common';
import { QueryResult } from 'pg';
import { client } from '../../db/client';

import { Cart } from '../models';

const DEFAULT_USER_ID = '40e62153-b5c6-4896-987c-f30f3678f608';

export enum CartStatuses {
  OPEN = 'OPEN',
  ORDERED = 'ORDERED',
}

@Injectable()
export class CartService {
  async findByUserId(userId: string): Promise<Cart> {
    const id = userId || DEFAULT_USER_ID;

    try {
      const queryCartsText = `select * from carts where user_id = '${id}'`;
      const result: QueryResult = await client(queryCartsText);

      if (result.rows.length === 0) {
        return null;
      }

      const cart = result.rows[0];

      const queryItemsText = `select * from cart_items where cart_id = '${cart.id}'`;
      const items = (await client(queryItemsText)).rows;

      cart.items = items.map(item => {
        item.product = {
          id: item.product_id,
        };
        return item;
      });

      return cart;
    } catch (err) {
      console.log('findByUserId: ', err);
      return err;
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = userId || DEFAULT_USER_ID;
    const createdAt = new Date().toJSON();
    const modifiedAt = new Date().toJSON();

    const columns = 'user_id, created_at, updated_at, status';
    const values = `'${id}', '${createdAt}', '${modifiedAt}', '${CartStatuses.OPEN}'`;
    const queryText = `INSERT INTO carts(${columns}) VALUES(${values}) RETURNING *`;

    try {
      const result: QueryResult = await client(queryText);
      if (result?.rows) {
        return result?.rows[0] as Cart;
      }
      return result as Cart;
    } catch (err) {
      console.log('createByUserId:', err);
      return err;
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId || DEFAULT_USER_ID);

    console.log('userCart', userCart);
    if (userCart) {
      return userCart;
    }
    const result: QueryResult = await this.createByUserId(userId);
    return result;
  }

  async updateByUserId(userId: string, req): Promise<Cart> {
    const { items } = JSON.parse(req.toString());

    const { id, ...rest } = await this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [...items, ...rest.items],
    };

    try {
      await Promise.all(
        items.map(item => {
          const values = `'${id}', '${item.count}', '${item.product.id}'`;
          const queryText = `insert into cart_items (cart_id, count, product_id) values(${values})`;
          return client(queryText);
        }),
      );

      return { ...updatedCart };
    } catch (err) {
      console.log('updateByUserId:', err);
      return err;
    }
  }

  async removeByUserId(userId): Promise<void> {
    try {
      const { id } = await this.findOrCreateByUserId(userId);
      const queryText = `DELETE FROM cart_items WHERE cart_id = '${id}'`;
      await client(queryText);
    } catch (err) {
      console.log('removeByUserId:', err);
      return err;
    }
  }
}
