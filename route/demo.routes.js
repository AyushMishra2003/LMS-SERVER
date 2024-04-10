import { Router } from "express";
import demoVideo from "../controllers/demo.controller.js";

const demoRoute=Router()

demoRoute.post('/',demoVideo)


export default demoRoute