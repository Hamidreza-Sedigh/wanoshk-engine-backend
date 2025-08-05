const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    ip: { type: String }, // افزودن IP
    read: { type: Boolean, default: false }, // 👈 این خط اضافه شود
  },    
  { timestamps: true }

)

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);

// export default mongoose.models.ContactMessage ||
//   mongoose.model("ContactMessage", ContactMessageSchema);