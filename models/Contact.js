const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Personal', 'Work', 'Family', 'Other'],
    default: 'Personal'
  },
  is_favorite: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Virtual 'id' field mapped from '_id' for seamless frontend compatibility
contactSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

contactSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Contact', contactSchema);
