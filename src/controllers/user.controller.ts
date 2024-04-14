import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
       data:{
        email,
        password: hashedPassword,
        token: '',
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, 'manug9704');

    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    res.status(200).json({ message: 'Login successful', token, email, userId: user.id});
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { token: '' },
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};