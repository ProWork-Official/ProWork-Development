import express from 'express'
const Router = express.Router();

import { 
    userSignUpPost, userSignUpGet, userLogOut, 
    userPersonalPost, userPersonalGet, userPersonalPatch,
    userAddressPost, userAddressGet, userAddressPatch,
    MyBookingPost, MyBookingGet
} from '../controllers/User.js';


Router.post("/signup", userSignUpPost);
Router.get("/signup", userSignUpGet);
Router.post("/logout", userLogOut);

Router.post("/personal", userPersonalPost)
Router.get("/personal", userPersonalGet)
Router.patch("/personal/edit", userPersonalPatch)

Router.post("/address", userAddressPost)
Router.get("/address", userAddressGet)
Router.patch("/address/edit", userAddressPatch)

Router.post("/booking", MyBookingPost)
Router.get("/booking", MyBookingGet)

export default Router