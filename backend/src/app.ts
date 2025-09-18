import express from "express";
import ocrRoutes from "./routes/ocrRoutes";
import cors from 'cors';


const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],

}));
app.use(express.json());

app.use("/api/ocr", ocrRoutes);

app.listen(3000,()=>{
console.log("server running")
})