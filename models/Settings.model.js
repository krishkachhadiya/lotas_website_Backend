const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName:     { type: String, default: '' },
  websiteTitle:    { type: String, default: '' },
  phone:           { type: String, default: '' },
  email:           { type: String, default: '' },
  address:         { type: String, default: '' },
  pagination:      { type: String, default: '10' },
  logo:            { type: String, default: '' },
  favicon:         { type: String, default: '' },
  ogImage:         { type: String, default: '' },
  facebook:        { type: String, default: '' },
  instagram:       { type: String, default: '' },
  linkedin:        { type: String, default: '' },
  copyright:       { type: String, default: '' },
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
