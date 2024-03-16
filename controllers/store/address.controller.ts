import expressAsyncHandler from "express-async-handler";
import Address, { IAddress } from "../../models/store/Address.model";
import ErrorHandler from "../../utils/ErrorHandler";
import mongoose from "mongoose";

/**
 * Creates a new address for a user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The created address.
 */
export const createAddress = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;

    if (!userId) return next(new ErrorHandler("User ID is required", 400));

    let { firstName, lastName, mobile, alternativeMobile, houseNo, street, landmark, city, state, pincode, isDefault } =
        req.body as IAddress;

    const isFirstAddress = await Address.countDocuments();

    if (isFirstAddress === 0) {
        isDefault = true;
    }

    const address = await Address.create({
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

    if (!address) return next(new ErrorHandler("Address could not be created", 400));

    res.status(201).json({ message: "Address created successfully", address });
});

/**
 * Edit an address for a user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response indicating the success of the address update.
 */
export const editAddress = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;
    const addressId = req.params.id;

    if (!userId) return next(new ErrorHandler("User ID is required", 400));
    if (!addressId) return next(new ErrorHandler("Address ID is required", 400));

    const { firstName, lastName, mobile, alternativeMobile, houseNo, street, landmark, city, state, pincode } =
        req.body as IAddress;

    const address = await Address.findByIdAndUpdate(addressId, {
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

    if (!address) return next(new ErrorHandler("Address could not be updated", 400));

    res.status(200).json({ message: "Address updated successfully", address });
});

/**
 * Deletes an address for a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves once the address is deleted.
 * @throws {ErrorHandler} - If the user ID or address ID is missing, or if the address could not be deleted.
 */
export const deleteAddress = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const addressId = req.params.id;

    if (!addressId) {
        return next(new ErrorHandler("Address ID is required", 400));
    }

    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
        return next(new ErrorHandler("Address could not be deleted", 400));
    }

    res.status(200).json({ message: "Address deleted successfully" });
});

/**
 * Retrieves the address associated with the given address ID and user ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns The address object if found, or an error if not found or unauthorized.
 */
export const getAddress = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const addressId = req.params.id;

    if (!addressId) {
        return next(new ErrorHandler("Address ID is required", 400));
    }

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
        return next(new ErrorHandler("Address not found", 404));
    }

    if (address.userId.toString() !== userId) {
        return next(new ErrorHandler("Unauthorized", 401));
    }

    res.status(200).json({ address });
});

/**
 * Retrieves addresses for a specific user.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns A JSON response containing the addresses.
 * @throws {ErrorHandler} If the user ID is missing or addresses are not found.
 */
export const getAddresses = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const addresses = await Address.find({ userId: userId });

    if (!addresses) {
        return next(new ErrorHandler("Addresses not found", 404));
    }

    res.json({ addresses });
});

/**
 * Sets the default address for a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves when the default address is set.
 * @throws {ErrorHandler} - If the user ID or address ID is missing, or if the address could not be updated.
 */
export const setDefaultAddress = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const addressId = req.params.id;

    if (!addressId) {
        return next(new ErrorHandler("Address ID is required", 400));
    }

    const checkExistingDefault = await Address.findOne({ userId, isDefault: true });

    if (checkExistingDefault) {
        checkExistingDefault.isDefault = false;
        await checkExistingDefault.save();
    }

    const address = await Address.findByIdAndUpdate(addressId, { isDefault: true });

    if (!address) {
        return next(new ErrorHandler("Address could not be updated", 400));
    }

    res.status(200).json({ message: "Default address set successfully", address });
});

/**
 * Retrieves the default address for a user.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves with the default address or an error.
 */
export const getDefaultAddress = expressAsyncHandler(async (req, res, next) => {
    const userId = req.customer?._id;

    if (!userId) {
        return next(new ErrorHandler("User ID is required", 400));
    }

    const address = await Address.findOne({ userId, isDefault: true });

    if (!address) {
        return next(new ErrorHandler("Default address not found", 404));
    }

    res.json({ address });
});
