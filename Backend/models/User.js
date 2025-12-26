const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    gemail: {
  type: String,
  unique: true,
  sparse: true, // ⭐ IMPORTANT
  validate: {
    validator: function (email) {
      if (!email) return true; // allow null
      return email.endsWith("@mnnit.ac.in");
    },
    message: "Gemail must be a valid MNNIT email"
  }
},
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Invalid email address"]
    },
    password: {
        type: String,
        minlength: 6
    },
    branch: {
        type: String,
        default:null
    },
          authProvider: {
  type: String,
  enum: ["local", "google"],
  default: "local"
},
     // (Optional)
     codeforcesUsername : {
        type: String,
        unique: true,  
        sparse: true   
    },
   
    codeforcesRating: {
        type: Number,
        default: 0  // 
    }, 
    // LeetCode Info
    leetcodeUsername: {
        type: String,
        unique: true,
        sparse: true
    },
    leetcodeRating: {
        type: Number,
        default: 0
    },
    year: {
        type: Number,  
        default: null   
    }

},{timestamps : true} );

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", userSchema);
