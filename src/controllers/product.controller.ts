import { Request as ExpressRequest, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Request extends ExpressRequest {
  userId?: number;
}

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price } = req.body;
  const userId = req.userId;

  if (userId === undefined) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        userId,
      },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const productId = parseInt(req.params.id);

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);
    const userId = req.userId;
    const { name, description, price } = req.body;
  
    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
  
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
  
      if (product.userId !== userId) {
        res.status(403).json({ message: "You do not have permission to alter someone else's product" });
        return;
      }
  
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { name, description, price },
      });
  
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product', error });
    }
  };
  
  export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const productId = parseInt(req.params.id);
    const userId = req.userId;  // ID del usuario obtenido de la autenticación
  
    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
  
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
  
      if (product.userId !== userId) {
        res.status(403).json({ message: "You do not have permission to delete someone else's product" });
        return;
      }
  
      await prisma.product.delete({
        where: { id: productId },
      });
  
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting product', error });
    }
  };

  // Eliminar un producto de una orden
export const removeProductFromOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId);
  const productId = parseInt(req.params.productId);
  const userId = req.userId; // Obtener el ID del usuario autenticado

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      res.status(403).json({ message: 'You do not have permission to modify this order' });
      return;
    }

    // Eliminar la relación entre el producto y la orden
    await prisma.order.update({
      where: { id: orderId },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
    });

    res.status(200).json({ message: 'Product removed from order' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product from order', error });
  }
};

// Agregar un producto a una orden
export const addProductToOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = parseInt(req.params.orderId);
  const productId = parseInt(req.params.productId);
  const userId = req.userId; // Obtener el ID del usuario autenticado

  try {
    // Verificar si la orden pertenece al usuario autenticado
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      res.status(403).json({ message: 'You do not have permission to modify this order' });
      return;
    }

    // Agregar la relación entre el producto y la orden
    await prisma.order.update({
      where: { id: orderId },
      data: {
        products: {
          connect: { id: productId },
        },
      },
    });

    res.status(200).json({ message: 'Product added to order' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product to order', error });
  }
};