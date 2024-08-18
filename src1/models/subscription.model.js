import mongoose , {Schema} from "mongoose"
const subscriptionSchema = Schema({
 subscriber : {
    type : Schema.Types.ObjectId , //one who is subscribing
    ref : "User"
 },

 channel : {
    type : Schema.Types.ObjectId , //one to whom subscriber is subscribing 
    ref : "User"
 },
 
  
}, {
    timestamps : true 
})
export default Subscription = mongoose.model("Subscription" , subscriptionSchema)