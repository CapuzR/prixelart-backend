const Admin = require( "../adminModel" );

//CRUD

const readAdminById = async (adminData)=> {
    let readedAdmin = await Admin.findOne({'_id': adminData.id}).exec();
    if(readedAdmin){
        return readedAdmin;
    }
    return false;
}

const readAllAdmins = async ()=> {
    let readedAdmin = await Admin.find({}).select('-_id, -password').exec();
    if(readedAdmin){
        return readedAdmin;
    }
    return false;
}

const readFullAdminByEmail = async(adminData)=> { return await Admin.findOne({'email': adminData.email}).exec()};
const readAdminByEmail = async(adminData)=> { return await Admin.findOne({'email': adminData.email}).select('-_id, -password').exec()};
const readAdminByUsername = async(username)=> { return await Admin.findOne({'username': username}).exec()};


const updateAdmin = async (adminData)=> {
    try{
        const toUpdateAdmin = await Admin.findOne({'email': adminData.email});
        toUpdateAdmin.set(adminData);
        const updatedAdmin = await toUpdateAdmin.save();
        if(!updatedAdmin) { return console.log('Admin update error: '+err); }
    
        return updatedAdmin;
    } catch(e) {
        return {
            success: false,
            message: e + 'Disculpa. No se pudo actualizar este administrador, inténtalo de nuevo por favor.'
        }
    }
}


//CRUD END

module.exports = {readAdminById, readAllAdmins, updateAdmin, readAdminByEmail, readAdminByUsername, readFullAdminByEmail};