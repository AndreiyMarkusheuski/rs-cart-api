import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './services';
import { AppRequest, getUserIdFromRequest } from '../shared';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  async getAll(@Req() req: AppRequest): Promise<any> {
    try {
      const orders = await this.orderService.getAll(getUserIdFromRequest(req));

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { orders },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  @Get(':order_id')
  async getOrderById(@Param('order_id') orderId: string): Promise<any> {
    try {
      const order = await this.orderService.getOrderById(orderId);

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

  @Post()
  async create(@Req() req: AppRequest, @Body() body: any): Promise<any> {
    try {
      const order = await this.orderService.createByUserId(
        getUserIdFromRequest(req),
        body,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: {
          order,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  @Put()
  async update(@Req() req: AppRequest, @Body() body: any): Promise<any> {
    try {
      const order = await this.orderService.updateByUserId(
        getUserIdFromRequest(req),
        body,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: {
          order,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error,
      };
    }
  }

  @Delete(':order_id')
  async delete(@Param('order_id') orderId: string): Promise<any> {
    try {
      await this.orderService.deleteById(orderId);

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
}
