import "dotenv/config";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
const app=express(), upload=multer({storage:multer.memoryStorage(),limits:{fileSize:15*1024*1024,files:2}});
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY}), PORT=process.env.PORT||3000, MODEL=process.env.OPENAI_MODEL||"gpt-5.6-luna";
app.use(express.static("."));
const schema={type:"object",additionalProperties:false,properties:{
card_information:{type:"object",additionalProperties:false,properties:{
sport:{type:"string"},player_or_character:{type:"string"},team_or_franchise:{type:"string"},year:{type:"string"},manufacturer:{type:"string"},set_name:{type:"string"},card_number:{type:"string"},rookie_or_first:{type:"string"},parallel_or_variation:{type:"string"},serial_number:{type:"string"},autograph:{type:"string"},relic:{type:"string"},other_visible_details:{type:"string"},confidence:{type:"string"}},required:["sport","player_or_character","team_or_franchise","year","manufacturer","set_name","card_number","rookie_or_first","parallel_or_variation","serial_number","autograph","relic","other_visible_details","confidence"]},
history:{type:"string"},listing_description:{type:"string"},social_media_post_ideas:{type:"array",items:{type:"string"}},hashtags:{type:"string"},content_ideas:{type:"array",items:{type:"string"}}},
required:["card_information","history","listing_description","social_media_post_ideas","hashtags","content_ideas"]};
const data=f=>`data:${f.mimetype};base64,${f.buffer.toString("base64")}`;
app.post("/api/analyze",upload.fields([{name:"front",maxCount:1},{name:"back",maxCount:1}]),async(req,res)=>{
try{
if(!process.env.OPENAI_API_KEY||process.env.OPENAI_API_KEY==="put_your_key_here")throw Error("OpenAI API key is not configured on the server.");
const front=req.files?.front?.[0],back=req.files?.back?.[0];if(!front)throw Error("Please upload the card front.");
const content=[{type:"input_text",text:`You are Mister E AI, a careful trading-card researcher. Analyze the card FRONT${back?" and BACK":""}. Read visible text, logos, numbering, copyright, stats and design clues. Never invent details; use Unknown when not confirmed. Produce six sections: (1) Card Information, (2) History of the card and athlete/character, (3) Listing Description, (4) several Social Media Post Ideas, (5) relevant Hashtags, (6) Content Ideas for Reels/TikTok/YouTube Shorts/Facebook. Do not assign a professional grade or claim exact value, authenticity, rarity or investment potential unless verified. Return only structured JSON.`},{type:"input_image",image_url:data(front),detail:"high"}];
if(back)content.push({type:"input_image",image_url:data(back),detail:"high"});
const r=await client.responses.create({model:MODEL,store:false,input:[{role:"user",content}],text:{format:{type:"json_schema",name:"mister_e_card_package",strict:true,schema}}});
if(!r.output_text)throw Error("AI returned no result.");res.json(JSON.parse(r.output_text));
}catch(e){console.error(e);res.status(500).json({error:e.message||"Analysis failed."})}});
app.listen(PORT,()=>console.log(`Mister E AI V5 running at http://localhost:${PORT}`));