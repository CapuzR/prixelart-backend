const Order = require('./orderModel');
const PaymentMethod = require('./paymentMethodModel');
const OrderPayment = require('./orderPaymentModel');
const dotenv = require('dotenv');
dotenv.config();


//Order
const createOrder = async (orderData)=> {
    try {
        console.log(orderData);
        const readedOrderByEmail = await readOrderByEmail(orderData);
        const readedOrderByUsername = await readOrderByUsername(orderData.username);
        if(readedOrderByUsername) {
            return {
                success: false,
                info: 'error_username',
                message: 'Disculpa, el nombre de usuario ya está registrado.'
            };
        }
        
        if(readedOrderByEmail){
            return {
                success: false,
                info: 'error_email',
                message: 'Disculpa, el correo del usuario ya está registrado.'
            };
        }     
        let newOrder = await new Order(orderData).save();
        return {
            res: {success: true, orderId: newOrder._id},
            newOrder: newOrder
        }

    } catch(e) {
        return 'Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.';
    }
}

const readOrderByEmail = async(orderData)=> { return await Order.findOne({'email': orderData.email}).select('-_id').exec()};
const readOrderByUsername = async(username)=> { return await Order.findOne({'username': username}).exec()};

const readAllOrders = async ()=> {
    let readedOrder = await Order.find({}).select('-_id').exec();
    if(readedOrder){
        return readedOrder;
    }
    return false;
}

const updateOrder = async (orderData)=> {
    try{
        const toUpdateOrder = await Order.findOne({'email': orderData.email});
        await toUpdateOrder.set(orderData);
        const updatedOrder = await toUpdateOrder.save();
        if(!updatedOrder) { return console.log('Order update error: '+err); }
    
        return updatedOrder;
    } catch(e) {
        return {
            success: false,
            message: e + 'Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.'
        }
    }
}

//Payment Methods
const createPaymentMethod = async (paymentMethodData)=> {
    try {
        console.log(paymentMethodData);
        const readedPaymentMethodById = await readPaymentMethodById(paymentMethodData.id);
        const readedPaymentMethodByName = await readPaymentMethodByName(paymentMethodData.name);
        
        if(readedPaymentMethodByName){
            return {
                success: false,
                info: 'error_email',
                message: 'Disculpa, esta forma de pago ya está registrada.'
            };
        }     

        if(readedPaymentMethodById){
            return {
                success: false,
                info: 'error_email',
                message: 'Disculpa, esta forma de pago ya está registrada.'
            };
        }     
        console.log(paymentMethodData);
        let newPaymentMethod = await new PaymentMethod(paymentMethodData).save();
        console.log(newPaymentMethod);
        return {
            res: {success: true, paymentMethodId: newPaymentMethod._id},
            newPaymentMethod: newPaymentMethod
        }

    } catch(e) {
        return 'Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.';
    }
}

const readPaymentMethodById = async(id)=> { return await PaymentMethod.findOne({'_id': id}).exec()};
const readPaymentMethodByName = async(name)=> { return await PaymentMethod.findOne({'name': name}).exec()};

const readAllPaymentMethods = async ()=> {
    let readedPaymentMethods = await PaymentMethod.find({}).exec();
    if(readedPaymentMethods){
        return readedPaymentMethods;
    }
    return false;
}

const updatePaymentMethod = async (paymentMethodData)=> {
    try{
        
        const readedPaymentMethodByName = await readPaymentMethodByName(paymentMethodData.name);
        
        if(readedPaymentMethodByName){
            return {
                success: false,
                info: 'error_email',
                message: 'Disculpa, el nombre en la forma de pago ya está registrado.'
            };
        }    

        const toUpdatePaymentMethod = await readPaymentMethodById(paymentMethodData.id);
        await toUpdatePaymentMethod.set(paymentMethodData);
        const updatedPaymentMethod = await toUpdatePaymentMethod.save();
        if(!updatedPaymentMethod) { return console.log('Order update error: '+err); }
    
        return updatedPaymentMethod;
    } catch(e) {
        return {
            success: false,
            message: e + 'Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.'
        }
    }
}

//Order Payment
const createOrderPayment = async (orderPaymentData)=> {
    try {
        const readedOrderPaymentByEmail = await readOrderPaymentByEmail(orderPaymentData);
        const readedOrderPaymentByUsername = await readOrderPaymentByUsername(orderPaymentData.username);
        if(readedOrderPaymentByUsername) {
            return {
                success: false,
                info: 'error_username',
                message: 'Disculpa, el nombre de usuario ya está registrado.'
            };
        }
        
        if(readedOrderPaymentByEmail){
            return {
                success: false,
                info: 'error_email',
                message: 'Disculpa, el correo del usuario ya está registrado.'
            };
        }     
        let newOrderPayment = await new Order(orderPaymentData).save();
        return {
            res: {success: true, orderPaymentId: newOrderPayment._id},
            newOrderPayment: newOrderPayment
        }

    } catch(e) {
        return 'Incapaz de crear el usuario, intenta de nuevo o consulta a soporte.';
    }
}

const readOrderPaymentByEmail = async(orderPaymentData)=> { return await OrderPayment.findOne({'email': orderPaymentData.email}).select('-_id').exec()};
const readOrderPaymentByUsername = async(username)=> { return await OrderPayment.findOne({'username': username}).exec()};

const readAllOrderPayments = async ()=> {
    let readedOrderPayments = await OrderPayment.find({}).select('-_id').exec();
    if(readedOrder){
        return readedOrderPayments;
    }
    return false;
}

const updateOrderPayment = async (orderPaymentData)=> {
    try{
        const toUpdateOrderPayment = await OrderPayment.findOne({'email': orderPaymentData.email});
        await toUpdateOrderPayment.set(orderPaymentData);
        const updatedOrderPayment = await toUpdateOrderPayment.save();
        if(!updatedOrderPayment) { return console.log('Order update error: '+err); }
    
        return updatedOrderPayment;
    } catch(e) {
        return {
            success: false,
            message: e + 'Disculpa. No se pudo actualizar este consumidor, inténtalo de nuevo por favor.'
        }
    }
}

module.exports = { 
    createOrder, readOrderByEmail, readOrderByUsername, readAllOrders, updateOrder,
    createPaymentMethod, readPaymentMethodById, readAllPaymentMethods, updatePaymentMethod,
    createOrderPayment, readOrderPaymentByEmail, readOrderPaymentByUsername, readAllOrderPayments, updateOrderPayment,
 }