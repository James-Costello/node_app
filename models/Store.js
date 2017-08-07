const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

//Data normalization should be as close to the model as possible.

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug : String,
  description : {
    type: String,
    trim : true
  },
  tags : [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
        type: Number,
        required: 'You must supply coordinates!'
      }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an auhtor'
  }
});

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')) {
    next(); //skip
    return; //stops slug function
  }
  this.slug = slug(this.name);
  //find other stores that have a slug
  const slugRegEx = new RegExp(`^$({this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({slug : slugRegEx});
  if(storesWithSlug.length){
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
  //make more resiliant, make slugs unique
})

//adding a method onto our Schema
//proper function is required for this to work
storeSchema.statics.getTagsList = function(){
  //static method bound to model
  return this.aggregate([
    //this is the pipeline
    { $unwind : '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1} } },
    { $sort: { count: -1 } }
  ]);
  //aggregate is just a method like find
  //takes an array of possible operators
}

module.exports = mongoose.model('Store', storeSchema)
