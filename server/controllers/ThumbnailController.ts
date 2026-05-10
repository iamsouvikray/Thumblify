import { Request, Response } from "express";
import axios from "axios";
import Thumbnail from "../models/ThumbnailModel.js";

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const {
      title,
      prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay
    } = req.body;

    // ✅ SAFETY CHECK (prevents 500 crash)
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
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

    console.log("RAPID API RESPONSE:", response.data);

    // ✅ FIXED IMAGE EXTRACTION (YOUR REAL ISSUE)
    const imageUrl =
      response.data?.final_result?.[0]?.origin ||
      response.data?.final_result?.[0]?.thumb;

    if (!imageUrl) {
      return res.status(500).json({
        success: false,
        message: "No image returned from AI API"
      });
    }

    // 💾 SAVE TO DB
    const thumbnail = await Thumbnail.create({
      userId: req.session.userId,
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
    console.log("FULL ERROR:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || "Generation failed"
    });
  }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await Thumbnail.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Thumbnail deleted"
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
