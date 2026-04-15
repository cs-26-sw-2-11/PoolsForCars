import { processReq } from "./router.js";
import { fileResponse, startServer } from "./server.js";
import {} from "./models/user.model.js";
//We use EC6 modules
export const cleanFormString = (form) => {
    try {
        form.replace;
        var underway = form.replace("nameInput=", "");
        underway = underway.replace("phoneInput=", "");
        // var login = underway.split("&")
        // console.log(login[0]+" + "+login[1])
    }
    catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
};
/*
export const loginUser = (name: string, phoneNumber: string) => {
    if(name === "Joachim" && phoneNumber === "12345678"){
        console.log("correct")
    }
}
 */
//# sourceMappingURL=app.js.map