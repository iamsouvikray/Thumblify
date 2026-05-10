import { Request, Response } from "express";
import axios from "axios";
import Thumbnail from "../models/ThumbnailModel.js";

export const generateThumbnail = async (req: Request, res: Response) => {
  try {

    console.log("🔥 Thumbnail API HIT");

    const {
      title,
      prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay
    } = req.body;

    // ✅ SAFE SESSION CHECK (prevents crash on Vercel)
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user"
      });
    }

    // 🔥 CALL RAPIDAPI
    const response = await axios.post(
      "https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php",
      {
        prompt: `${title}. ${prompt}`,
        style_id: 4,
        size: "1-1"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-host":
            "ai-text-to-image-generator-flux-free-api.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPIDAPI_KEY as string
        }
      }
    );

    console.log("RAPID RESPONSE:", response.data);

    // ✅ SAFE IMAGE EXTRACTION (FIXED)
    const imageUrl =
      response.data?.final_result?.[0]?.origin ||
      response.data?.final_result?.[0]?.thumb;

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "Image not generated from API"
      });
    }

    // 💾 SAVE TO DATABASE
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      user_prompt: prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      image_url: imageUrl,
      isGenerating: false
    });

    return res.json({
      success: true,
      thumbnail,
      message: "Thumbnail generated successfully"
    });

  } catch (error: any) {

    console.log("❌ FULL ERROR:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while generating thumbnail"
    });
  }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {

    const { id } = req.params;

    await Thumbnail.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Thumbnail deleted successfully"
    });

  } catch (error: any) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Delete failed"
    });
  }
};
