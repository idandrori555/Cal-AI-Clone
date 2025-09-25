import { Router } from "express";
import { analyzeFood } from "../hooks/macros";
import multer from "multer";

const router = Router();


// Store files in memory, not on disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), analyzeFood);

export default router;
