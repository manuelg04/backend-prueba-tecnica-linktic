import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import { setupSwagger } from '../swagger'
const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/auth', userRoutes)

setupSwagger(app);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});