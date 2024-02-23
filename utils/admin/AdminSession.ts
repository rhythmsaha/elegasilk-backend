import Admin, { IAdmin } from "../../models/Admin.model";

class AdminSession {
    _id: IAdmin["_id"];
    firstName: IAdmin["firstName"];
    lastName: IAdmin["lastName"];
    username: IAdmin["username"];
    email: IAdmin["email"];
    role: IAdmin["role"];
    avatar: IAdmin["avatar"];
    status: IAdmin["status"];
    static accessToken: string;

    constructor(id: IAdmin["_id"], firstName: IAdmin["firstName"], lastName: IAdmin["lastName"], username: IAdmin["username"], email: IAdmin["email"], role: IAdmin["role"], avatar: IAdmin["avatar"], status: IAdmin["status"]) {
        this._id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.email = email;
        this.role = role;
        this.avatar = avatar;
        this.status = status;
    }

    static from(admin: IAdmin): AdminSession {
        return new AdminSession(admin._id, admin.firstName, admin.lastName, admin.username, admin.email, admin.role, admin.avatar, admin.status);
    }

    private createProfile() {
        return {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            email: this.email,
            role: this.role,
            avatar: this.avatar,
            status: this.status,
        };
    }

    private createSession(): object {
        const userdata = this.createProfile();
        const session = {
            user: userdata,
            accessToken: new Admin({ _id: userdata._id, role: userdata.role }).signAccessToken(),
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
        const user = this.createProfile();
        const message = "Profile updated successfully";
        const success = true;
        return { success, message, user };
    }

    get adminProfile(): object {
        return this.createProfile();
    }
}

export default AdminSession;
