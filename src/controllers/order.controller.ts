import { Request, Response } from 'express';
import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { cartProducts, userId } = req.body;
  console.log('Productos en el carrito:', cartProducts);

  try {
    // Obtener los IDs de los productos del carrito
    const productIds = cartProducts.map((product: any) => product.id);

    // Calcular el precio total de la orden
    const totalPrice = cartProducts.reduce((total: number, product: any) => total + Number(product.price), 0);

    // Crear la orden y asociar los productos existentes
    const newOrder = await prisma.order.create({
      data: {
        totalPrice,
        user: {
          connect: { id: userId },
        },
        products: {
          connect: productIds.map((productId: number) => ({ id: productId })),
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