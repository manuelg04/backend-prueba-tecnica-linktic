import { Request, Response } from 'express';
import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { cartProducts, userId } = req.body;
  console.log('Productos en el carrito:', cartProducts);

  try {
    const createdProducts = await prisma.product.createMany({
      data: cartProducts.map((product: any) => ({
        name: product.name,
        description: product.description,
        price: product.price,
        userId: userId,
      })),
    });

    const productIds = await prisma.product.findMany({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 60000),
        },
      },
      select: {
        id: true,
      },
    });

    const totalPrice = cartProducts.reduce((total: number, product: any) => total + Number(product.price), 0);

    const newOrder = await prisma.order.create({
      data: {
        totalPrice,
        user: {
          connect: { id: userId },
        },
        products: {
          connect: productIds.map((product) => ({ id: product.id })),
        },
      },
      include: {
        products: true,
        user: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: 'Error creating order', error: error.message });
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

export const getOrdersByUserId = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        products: true,
      },
    });

    res.status(200).json(orders);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.id);
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
  const orderId = parseInt(req.params.id);

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