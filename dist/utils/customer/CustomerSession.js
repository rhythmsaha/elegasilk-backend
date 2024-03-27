"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Customer_model_1 = __importDefault(require("../../models/store/Customer.model"));
class CustomerSession {
    constructor(id, firstName, lastName, email, status, verified) {
        this._id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.status = status;
        this.verified = verified;
    }
    static from(customer) {
        return new CustomerSession(customer._id, customer.firstName, customer.lastName, customer.email, customer.status, customer.verified);
    }
    createProfile() {
        return {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
        };
    }
    createSession() {
        const user = this.createProfile();
        const session = {
            user,
            accessToken: new Customer_model_1.default({ _id: user._id }).signAccessToken(),
        };
        return session;
    }
    get loginSession() {
        const session = this.createSession();
        const message = "Login successful";
        const success = true;
        return Object.assign({ success, message }, session);
    }
    get refreshTokenSession() {
        const session = this.createSession();
        const message = "Token refreshed";
        const success = true;
        return Object.assign({ success, message }, session);
    }
    get updateProfileSession() {
        const profile = this.createProfile();
        const message = "Profile updated successfully";
        const success = true;
        return { success, message, profile };
    }
    get profile() {
        return this.createProfile();
    }
}
exports.default = CustomerSession;
