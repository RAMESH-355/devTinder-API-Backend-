const mongoose = require("mongoose");
const User = require("./user");

const connectionRequestSchema = new mongoose.Schema( 
    {
        fromUserId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: User
        },
        toUserId:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: User
        },
        status:{
            type: String,
            required: true,
            enum: {
                values: ["accepted","rejected","interested","ignored"],
                message: '{VALUE} is incorrect status type'
            }, 

        },
    },
 ); 

 connectionRequestSchema.pre("save",function(next){

    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Self connection is not valid");
    }

  next();
});

 const connectionRequestModel = new mongoose.model("connectionRequest",connectionRequestSchema);

 module.exports = connectionRequestModel;