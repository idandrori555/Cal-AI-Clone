import type { NextFunction, Request, Response } from "express";
import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import { GEMINI_TOKEN } from "../env";

const ai = new GoogleGenAI({ apiKey: GEMINI_TOKEN });

const analyzeImageWithAI = async (imageBuffer: Buffer<ArrayBufferLike>, mimeType: string) => {
  const blob = new Blob([imageBuffer], { type: mimeType });

  const image = await ai.files.upload({ file: blob });
  if (!image?.uri || !image?.mimeType) throw new Error("Incorrect image format / uri");

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      createUserContent([
        createPartFromUri(image.uri, image.mimeType),
      ]),
    ],


    config: {
      systemInstruction: "You are a food macro and calorie extractor. you will be provided a image of food and you should output of the macros (calories, protien, etc). return RAW JSON in this format: {calories, protein, carbs, fat}",
      responseMimeType: "application/json",
      responseJsonSchema: { calories: String, protein: String, carbs: String, fat: String }
    },
  });

  console.log(res.text);
  return res.text;
}

export const analyzeFood = async (req: Request, res: Response, next: NextFunction) => {
  const file = req?.file;

  if (!file) {
    return res.status(400).json({ message: "No File Uploaded", data: null });
  }

  // The raw image data is here:
  const buffer = file.buffer; // Buffer
  const mimeType = file.mimetype; // e.g. "image/png"

  const macros = await analyzeImageWithAI(buffer, mimeType);

  res.json({ data: macros, message: "Success" });
}

