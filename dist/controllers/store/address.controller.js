"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultAddress = exports.setDefaultAddress = exports.getAddresses = exports.getAddress = exports.deleteAddress = exports.editAddress = exports.createAddress = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Address_model_1 = __importDefault(require("../../models/store/Address.model"));
const ErrorHandler_1 = __importDefault(require("../../utils/ErrorHandler"));
/**
 * Creates a new address for a user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The created address.
 */
exports.createAddress = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.customer) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId)
        return next(new ErrorHandler_1.default("User ID is required", 400));
    let { firstName, lastName, mobile, alternativeMobile, houseNo, street, landmark, city, state, pincode, isDefault } = req.body;
    const isFirstAddress = yield Address_model_1.default.countDocuments();
    if (isFirstAddress === 0) {
        isDefault = true;
    }
    const address = yield Address_model_1.default.create({
        userId,
        firstName,
        lastName,
        mobile,
        alternativeMobile,
        houseNo,
        street,
        landmark,
        city,
        state,
        pincode,
        isDefault,
    });
    if (!address)
        return next(new ErrorHandler_1.default("Address could not be created", 400));
    res.status(201).json({ message: "Address created successfully", address });
}));
/**
 * Edit an address for a user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the address update.
 */
exports.editAddress = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.customer) === null || _b === void 0 ? void 0 : _b._id;
    const addressId = req.params.id;
    if (!userId)
        return next(new ErrorHandler_1.default("User ID is required", 400));
    if (!addressId)
        return next(new ErrorHandler_1.default("Address ID is required", 400));
    const { firstName, lastName, mobile, alternativeMobile, houseNo, street, landmark, city, state, pincode } = req.body;
    const address = yield Address_model_1.default.findByIdAndUpdate(addressId, {
        userId,
        firstName,
        lastName,
        mobile,
        alternativeMobile,
        houseNo,
        street,
        landmark,
        city,
        state,
        pincode,
    });
    if (!address)
        return next(new ErrorHandler_1.default("Address could not be updated", 400));
    res.status(200).json({ message: "Address updated successfully", address });
}));
/**
 * Deletes an address for a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves once the address is deleted.
 * @throws {ErrorHandler} - If the user ID or address ID is missing, or if the address could not be deleted.
 */
exports.deleteAddress = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const userId = (_c = req.customer) === null || _c === void 0 ? void 0 : _c._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID is required", 400));
    }
    const addressId = req.params.id;
    if (!addressId) {
        return next(new ErrorHandler_1.default("Address ID is required", 400));
    }
    const address = yield Address_model_1.default.findOneAndDelete({ _id: addressId, userId });
    if (!address) {
        return next(new ErrorHandler_1.default("Address could not be deleted", 400));
    }
    res.status(200).json({ message: "Address deleted successfully" });
}));
/**
 * Retrieves the address associated with the given address ID and user ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The address object if found, or an error if not found or unauthorized.
 */
exports.getAddress = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const userId = (_d = req.customer) === null || _d === void 0 ? void 0 : _d._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID is required", 400));
    }
    const addressId = req.params.id;
    if (!addressId) {
        return next(new ErrorHandler_1.default("Address ID is required", 400));
    }
    const address = yield Address_model_1.default.findOne({ _id: addressId, userId });
    if (!address) {
        return next(new ErrorHandler_1.default("Address not found", 404));
    }
    if (address.userId.toString() !== userId) {
        return next(new ErrorHandler_1.default("Unauthorized", 401));
    }
    res.status(200).json({ address });
}));
/**
 * Retrieves addresses for a specific user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response containing the addresses.
 * @throws {ErrorHandler} If the user ID is missing or addresses are not found.
 */
exports.getAddresses = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const userId = (_e = req.customer) === null || _e === void 0 ? void 0 : _e._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID is required", 400));
    }
    const addresses = yield Address_model_1.default.find({ userId: userId });
    if (!addresses) {
        return next(new ErrorHandler_1.default("Addresses not found", 404));
    }
    res.json({ addresses });
}));
/**
 * Sets the default address for a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the default address is set.
 * @throws {ErrorHandler} - If the user ID or address ID is missing, or if the address could not be updated.
 */
exports.setDefaultAddress = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const userId = (_f = req.customer) === null || _f === void 0 ? void 0 : _f._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID is required", 400));
    }
    const addressId = req.params.id;
    if (!addressId) {
        return next(new ErrorHandler_1.default("Address ID is required", 400));
    }
    const checkExistingDefault = yield Address_model_1.default.findOne({ userId, isDefault: true });
    if (checkExistingDefault) {
        checkExistingDefault.isDefault = false;
        yield checkExistingDefault.save();
    }
    const address = yield Address_model_1.default.findByIdAndUpdate(addressId, { isDefault: true });
    if (!address) {
        return next(new ErrorHandler_1.default("Address could not be updated", 400));
    }
    res.status(200).json({ message: "Default address set successfully", address });
}));
/**
 * Retrieves the default address for a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves with the default address or an error.
 */
exports.getDefaultAddress = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const userId = (_g = req.customer) === null || _g === void 0 ? void 0 : _g._id;
    if (!userId) {
        return next(new ErrorHandler_1.default("User ID is required", 400));
    }
    const address = yield Address_model_1.default.findOne({ userId, isDefault: true });
    if (!address) {
        return next(new ErrorHandler_1.default("Default address not found", 404));
    }
    res.json({ address });
}));
