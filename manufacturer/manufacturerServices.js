const Manufacturer = require( "./manufacturerModel" );
const userService = require( "../user/userServices/userServices" );

//Esta todo sin hacer, solo se cambió la palabra prixer por manufacturer
//CRUD
const createManufacturer = async (manufacturerData)=> {
    manufacturerData.id = manufacturerData.userId;
    const isManufacturer = await readManufacturer(manufacturerData);
    try {
        if(isManufacturer) {
            return {
                success: false,
                message: 'Disculpa, este usuario ya está asignado a un Manufacturer'
            }
        } else {
            return {
                success: true,
                manufacturerData: await new Manufacturer(manufacturerData).save()
            }
        }

    }catch(e) {
        return {
            success: false,
            message: e + 'Disculpa. No se pudo cargar tus datos de Manufacturer, inténtalo de nuevo por favor.'
        }
    }
}

const mergeManufacturerAndUser = (readedManufacturer, readedUser)=> {

    let manufacturer = {};

    manufacturer['manufacturerId'] = readedManufacturer.id;
    manufacturer['username'] = readedUser.username;
    manufacturer['firstName'] = readedUser.firstName;
    manufacturer['lastName'] = readedUser.lastName;
    manufacturer['email'] = readedUser.email;
    manufacturer['specialty'] = readedManufacturer.specialty;
    manufacturer['instagram'] = readedManufacturer.instagram;
    manufacturer['dateOfBirth'] = readedManufacturer.dateOfBirth;
    manufacturer['phone'] = readedManufacturer.phone;
    manufacturer['country'] = readedManufacturer.country;
    manufacturer['city'] = readedManufacturer.city;
    manufacturer['avatar'] = readedManufacturer.avatar;

    return manufacturer;
}

const readManufacturer = async (manufacturerData)=> {
    //Este manufacturerData.id debería cambiarse por manufacturerData.userId. Hay que validar dónde está y cambiarlo (Incluyendo los tests).
    let readedManufacturer = await Manufacturer.findOne({'userId': manufacturerData.id}).exec();
    if(readedManufacturer){
        const readedUser = await userService.readUserById({'id': manufacturerData.id});
        const manufacturer = await mergeManufacturerAndUser(readedManufacturer, readedUser);
        return manufacturer;
    }

    return readedManufacturer;

}

const readAllManufacturers = async ()=> {
    try {
    const readedManufacturers = await Manufacturer.find({}).exec();
    if(readedManufacturers){
        const data = {
            info: 'Todos los Manufacturers disponibles',
            manufacturers: readedManufacturers
        }
        return data;
    } else {
        const data = {
            info: 'No hay Manufacturers registrados',
            manufacturers: null
        }
        return data;
    }
} catch(error){
    console.log(error);
    return error;
}
}

const readAllManufacturersFull = async ()=> {
    try {
    const readedManufacturers = await Manufacturer.find({}).exec();
    let data = [];
    if(readedManufacturers){
        data = await Promise.all(readedManufacturers.map( async (readedManufacturer)=>{
            const readedUser = await userService.readUserById({'id': readedManufacturer.userId});
            if(readedUser) {
                const manufacturer = mergeManufacturerAndUser(readedManufacturer, readedUser);
                return manufacturer;
            } else {
                return {
                    info: 'El Manufacturer ' + readedManufacturer.username + ' no está asignado a un usuario.',
                    manufacturers: null
                }
            }
        }));
        const manufacturers = {
            info: 'Manufacturers disponibles',
            manufacturers: data
        }
        return manufacturers;
    } else {
        const data = {
            info: 'No hay Manufacturers registrados',
            manufacturers: null
        }
        return data;
    }
} catch(error){
    console.log(error);
    return error;
}
}

const updateManufacturer = async (manufacturerData, userData)=> {
    const toUpdateManufacturer = await Manufacturer.findOne({'userId': userData.id});
    toUpdateManufacturer.set(manufacturerData);
    const updatedManufacturer = await toUpdateManufacturer.save();
    if(!updatedManufacturer) { return console.log('Manufacturer update error: '+err); }

    const updatedUser = await userService.updateUser(userData);
    const manufacturer = await mergeManufacturerAndUser(updatedManufacturer, updatedUser);

    return manufacturer;
}

const disableManufacturer = (manufacturerData)=> {

}

const removeManufacturers = async ()=> {
    const removedManufacturers = await Manufacturer.deleteMany({});
    if(removedManufacturers) {
        return 'Se eliminaron: ' + removedManufacturers;
    } else {
        return removedManufacturers;
    }
}
//CRUD END

module.exports = {createManufacturer, readAllManufacturers, readManufacturer, updateManufacturer, disableManufacturer, removeManufacturers, readAllManufacturersFull};