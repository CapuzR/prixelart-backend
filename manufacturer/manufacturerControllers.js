const manufacturerServices = require( "./manufacturerServices" );
const userControllers = require('../user/userControllers/userControllers');

//Esta todo sin hacer, solo se cambió la palabra prixer por manufacturer
//CRUD
const createManufacturer = async (req, res)=> {
    try {
        const manufacturerData = {
          //Falta todo
        }

        res.send(await manufacturerServices.createManufacturer(manufacturerData));
    }catch(e) {
      res.status(500).send(e);
    }
  }

const readManufacturer = async (req, res)=> {
  try {
    const user = await userControllers.readUserByUsername(req);
    const readedManufacturer = await manufacturerServices.readManufacturer(user);
    res.send(readedManufacturer);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllManufacturers = async (req, res)=> {
  try {
    const readedManufacturers = await manufacturerServices.readAllManufacturers();
    res.send(readedManufacturers);
  } catch (err) {
    res.status(500).send(err);
  }
}

const readAllManufacturersFull = async (req, res)=> {
  try {
    const readedManufacturers = await manufacturerServices.readAllManufacturersFull();
    res.send(readedManufacturers);
  } catch (err) {
    res.status(500).send(err);
  }
}

const updateManufacturer = async (req, res)=> {
  try {
    const manufacturer = {
      "specialty": req.body.specialty,
      "instagram": req.body.instagram,
      "dateOfBirth": req.body.dateOfBirth,
      "phone": req.body.phone,
      "country": req.body.country,
      "city": req.body.city,
      "username": req.body.username,
      "avatar": req.body.avatar
    }

    const user = {
      "username": req.body.username,
      "firstName": req.body.firstName,
      "lastName": req.body.lastName,
      "email": req.body.email,
      "id": req.user.id
    }
    const updates = await manufacturerServices.updateManufacturer(manufacturer, user);
    return res.send(updates);
  } catch (err) {
    res.status(500).send(err);
  }
}

const disableManufacturer = async (req, res)=> {
  try {
    const disabledUser = await manufacturerServices.disableManufacturer(req.body);
    return res.send(disabledUser);
  } catch (err) {
    res.status(500).send(err);
  }
}

module.exports = { createManufacturer, readAllManufacturers, readManufacturer, updateManufacturer, disableManufacturer, readAllManufacturersFull };

//CRUD END