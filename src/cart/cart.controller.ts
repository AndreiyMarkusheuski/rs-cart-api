import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  Post,
  HttpStatus,
} from '@nestjs/common';

// import { BasicAuthGuard, JwtAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    try {
      const cart = await this.cartService.findOrCreateByUserId(
        getUserIdFromRequest(req),
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { ...cart, total: calculateCartTotal(cart) },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) {
    try {
      const cart = await this.cartService.updateByUserId(
        getUserIdFromRequest(req),
        body,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: {
          cart,
          total: calculateCartTotal(cart),
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Delete()
  async clearUserCart(@Req() req: AppRequest) {
    try {
      await this.cartService.removeByUserId(getUserIdFromRequest(req));

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(BasicAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    try {
      const userId = getUserIdFromRequest(req);
      const cart = await this.cartService.findByUserId(userId);

      if (!(cart && cart.items.length)) {
        const statusCode = HttpStatus.BAD_REQUEST;
        req.statusCode = statusCode;

        return {
          statusCode,
          message: 'Cart is empty',
        };
      }

      const { id: cartId, items } = cart;
      const total = calculateCartTotal(cart);
      const order = this.orderService.createByUserId(userId, {
        ...body,
        userId,
        cartId,
        items,
        total,
      });
      await this.cartService.removeByUserId(userId);

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { order },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }
}
