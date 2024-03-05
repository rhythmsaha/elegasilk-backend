import Customer, { ICustomer } from "../../models/store/Customer.model";

class CustomerSession {
    _id: ICustomer["_id"];
    firstName: ICustomer["firstName"];
    lastName: ICustomer["lastName"];
    email: ICustomer["email"];
    phone: ICustomer["phone"];
    status: ICustomer["status"];
    verified: ICustomer["verified"];
    static accessToken: string;

    constructor(id: ICustomer["_id"], firstName: ICustomer["firstName"], lastName: ICustomer["lastName"], email: ICustomer["email"], phone: ICustomer["phone"], status: ICustomer["status"], verified: ICustomer["verified"]) {
        this._id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.verified = verified;
    }

    static from(customer: ICustomer): CustomerSession {
        return new CustomerSession(customer._id, customer.firstName, customer.lastName, customer.email, customer.phone, customer.status, customer.verified);
    }

    private createProfile() {
        return {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
        };
    }

    private createSession(): object {
        const user = this.createProfile();
        const session = {
            user,
            accessToken: new Customer({ _id: user._id }).signAccessToken(),
        };
        return session;
    }

    get loginSession(): object {
        const session = this.createSession();
        const message = "Login successful";
        const success = true;
        return { success, message, ...session };
    }

    get refreshTokenSession(): object {
        const session = this.createSession();
        const message = "Token refreshed";
        const success = true;
        return { success, message, ...session };
    }

    get updateProfileSession(): object {
        const profile = this.createProfile();
        const message = "Profile updated successfully";
        const success = true;
        return { success, message, profile };
    }

    get profile(): object {
        return this.createProfile();
    }
}

export default CustomerSession;
