import validator from "validator";
import ErrorHandler from "../utils/ErrorHandler";
import Color from "../models/color.model";
import { IColorOptions } from "../types/typings";

class ColorService {
    private static validateColorInput({ hex, name, status }: IColorOptions) {
        if (hex && !validator.isHexColor(hex)) {
            throw new ErrorHandler("Please provide a valid hex color", 400);
        }

        if (name && !validator.isAlpha(name)) {
            throw new ErrorHandler("Please provide a valid name", 400);
        }

        if (status && typeof status !== "boolean") {
            throw new ErrorHandler("Status must be a boolean value", 400);
        }
    }

    public static async createColor(options: IColorOptions) {
        this.validateColorInput(options);
        const { name, hex, status } = options;

        const newColor = await Color.create({
            name,
            hex,
            status,
        });

        return newColor;
    }

    public static async updateColor(id: string, options: IColorOptions) {
        if (!validator.isMongoId(id)) {
            throw new ErrorHandler("Please provide a valid color id", 400);
        }

        this.validateColorInput(options);

        const { name, hex, status } = options;

        const updatedColor = await Color.findByIdAndUpdate(
            id,
            {
                name,
                hex,
                status,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedColor) {
            throw new ErrorHandler("Failed to update color!", 404);
        }

        return updatedColor;
    }

    public static async deleteColor(id: string) {
        if (!validator.isMongoId(id)) {
            throw new ErrorHandler("Please provide a valid color id", 400);
        }

        const color = await Color.findByIdAndDelete(id);

        if (!color) {
            throw new ErrorHandler("Color not found", 404);
        }

        return color;
    }

    public static async getColorById(id: string) {
        if (!validator.isMongoId(id)) {
            throw new ErrorHandler("Please provide a valid color id", 400);
        }

        const color = await Color.findById(id);

        if (!color) throw new ErrorHandler("Color not found", 404);

        return color;
    }

    public static async getColors() {
        const colors = await Color.find();
        if (!colors) throw new ErrorHandler("Colors not found", 404);
        return colors;
    }
}

export default ColorService;
