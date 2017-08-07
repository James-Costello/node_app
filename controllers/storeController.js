const mongoose = require('mongoose');
//concept of singleton, only import model once and referecne anywhere
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto) {
      next(null, true);
    } else {
      next({message: 'Filetype Unacceptable'}, false);
    }
  }
}

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index')
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store'});
  // res.send('It works?');
}

// exports.createStore = (req, res) => {
//   // res.json(req.body)
//   // res.send('It works?');
//   const store = new Store(req.body);
//   store.save(); //THIS IS WHERE THE DB IS ACTUALLY UPDATED
// }

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if( !req.file) {
    next();
    return;
  }
  console.log(req.file);
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //resizing
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once written to file system, keep going
  next();
}


exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}. Leave a review?`)
  res.redirect(`/store/${store.slug}`);
  console.log("PRAISE JAH")
};

//When you have an async function, you must return to your routes
//and wrap yr storeController in catchErrors
exports.getStores = async (req, res) => {
  //Query Database for all stores
  const stores = await Store.find();
  res.render('stores', { title : 'Stores', stores })
};


const confirmOwner = (store,user) => {
  if(!store.author.equals) {
    throw Error('You must own a store in order to edit it!')
  } //compare Obj Id to String
};

exports.editStore = async (req, res) => {
//   //Find Store given ID
//   // res.json(req.params)

  const store = await Store.findOne({ _id: req.params.id });
//   // res.json(store);
  confirmOwner(store, req.user);
//   //Confirm user is owner of store
//   //Render out the edit form so the user can update their store
  res.render('editStore', {title: `Edit ${store.name}`, store})
}

exports.updateStore = async (req,res) => {
  //set location data to be point
  req.body.location.type = 'Point';
  //find and update the store
  // const store = Store.findOneAndUpdate(query, data, options)
  const store = await Store.findOneAndUpdate({_id: req.params.id }, req.body, {
    new: true, //return new store instead of old store
    runValidators: true // ths forces out model to run the initial creation validators
  }).exec(); //runs the query, this returns a promise and with await the data is stored
  req.flash('sucess', `Sucessfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`)
  res.redirect(`/stores/${store._id}/edit`);
  //Redirect them the store and tell them it worked
};

exports.getStoreBySlug = async (req, res, next) => {
  // res.send('Shit works dude, chill.')
  const store = await Store.findOne({ slug: req.params.slug }).
    populate('author');
  if(!store) return next();
  res.render('store', { store, title: store.name})
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true }
  const tagsPromise = Store.getTagsList();
  const storesPromise= Store.find({ tags: tagQuery})

  //Awaiting multiple promises
  const [tags, stores]= await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', { tags, title: 'Tags', tag, stores});
};

