import { io } from './server.ts';
import OrderModel from './order/orderModel.ts';

export const initializeSocketListeners = () => {
  console.log('Inicializando los listeners de Socket.IO para la base de datos...');

  try {
    const orderChangeStream = OrderModel.watch();
    orderChangeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
        io.emit('newOrder', change.fullDocument);
        console.log('Evento "newOrder" emitido.');
      }
      // Puedes añadir más lógica para 'update', etc.
    });
    console.log('✅ Vigilando cambios en la colección de Pedidos.');
  } catch (error) {
    console.error('❌ Error al iniciar el Change Stream de Pedidos:', error);
  }
};