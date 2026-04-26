import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyCbF_iPod585jzu3bj8-5Ze6FwvpaZAP40");

async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash worked");
  } catch (e) {
    console.error("gemini-1.5-flash error:", e.message);
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-2.5-flash worked");
  } catch (e) {
    console.error("gemini-2.5-flash error:", e.message);
  }
}
run();
