import { Injectable } from '@nestjs/common';
import { QueryResult } from 'pg';
import { v4 } from 'uuid';
import { client } from '../../db/client';

import { Order } from '../models';

@Injectable()
export class OrderService {
  private orders: Record<string, Order> = {};

  async getOrderById(orderId: string) {
    try {
      const ordersQuery = `select * from orders where order_id = ${orderId};`;
      const orders: QueryResult = await client(ordersQuery);
      if (orders) {
        return orders;
      } else throw new Error('Orders not found');
    } catch (err) {
      console.log('getOrderById', err);
      return err;
    }
  }

  async getAll(userId: string) {
    try {
      const ordersQuery = `select * from orders where user_id = ${userId};`;
      const orders: QueryResult = await client(ordersQuery);
      if (orders) {
        return orders;
      } else throw new Error('Orders not found');
    } catch (err) {
      console.log('getAll:', err);
      return err;
    }
  }

  async createByUserId(userId: string, data: any) {
    const id = v4(v4());
    const order = {
      ...data,
      id,
      status: 'inProgress',
    };

    try {
      const queryText = `insert into orders (user_id, cart_id, payment, delivery, comments, status, total) values (${order}) where user_id = ${userId};`;
      return await client(queryText);
    } catch (err) {
      console.log('createByUserId:', err);
      return err;
    }
  }

  async updateByUserId(userId: string, data) {
    const { items } = JSON.parse(data.toString());

    const updatedOrder = {
      userId,
      order: [...items],
    };

    try {
      await Promise.all(
        items.map(item => {
          const values = `'${userId}', '${item.count}', '${item.product.id}'`;
          const queryText = `insert into orders (user_id, cart_id, payment, delivery, comments, status, total) values(${values})`;
          return client(queryText);
        }),
      );

      return { ...updatedOrder };
    } catch (err) {
      console.log('updateByUserId:', err);
      return err;
    }
  }

  async deleteById(orderId: string) {
    try {
      const queryText = `DELETE FROM orders WHERE order_id = '${orderId}'`;
      return await client(queryText);
    } catch (err) {
      console.log('deleteById:', err);
      return err;
    }
  }
}
