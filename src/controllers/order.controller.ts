import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { productIds } = req.body;

  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const totalPrice = products.reduce((total, product) => total + Number(product.price), 0);

    const newOrder = await prisma.order.create({
      data: {
        products: {
          connect: products.map((product) => ({ id: product.id })),
        },
        totalPrice,
      },
      include: {
        products: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: true,
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        products: true,
      },
    });

    if (order) {
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order', error });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;
  const { productIds } = req.body;

  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const totalPrice = products.reduce((total, product) => total + Number(product.price), 0);

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        products: {
          set: products.map((product) => ({ id: product.id })),
        },
        totalPrice,
      },
      include: {
        products: true,
      },
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;

  try {
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};