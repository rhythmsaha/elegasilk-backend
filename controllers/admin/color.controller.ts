import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import ColorService from "../../services/ColorService";

export const createColor = asyncHandler(async (req: Request, res: Response) => {
    const { name, hex, status } = req.body;

    const color = await ColorService.createColor({
        name,
        hex,
        status,
    });

    res.status(201).json({
        success: true,
        data: color,
    });
});

export const updateColor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, hex, status } = req.body;

    const color = await ColorService.updateColor(id, {
        name,
        hex,
        status,
    });

    res.status(200).json({
        success: true,
        data: color,
    });
});

export const deleteColor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const color = await ColorService.deleteColor(id);

    res.status(200).json({
        success: true,
        data: {},
    });
});

export const getColors = asyncHandler(async (req: Request, res: Response) => {
    const colors = await ColorService.getColors();

    res.status(200).json({
        success: true,
        data: colors,
    });
});

export const getColor = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const color = await ColorService.getColorById(id);

    res.status(200).json({
        success: true,
        data: color,
    });
});
