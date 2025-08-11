import IK2d6ActorSheet from "./module/sheets/ik2d6CharacterSheet.mjs";
import IK2d6ItemSheet from "./module/sheets/ik2d6ItemSheet.mjs";
import { ik2d6 } from "./module/sheets/config.js";

Hooks.once("init", function() {
    console.log("ik2d6 | initialising system")

    CONFIG.ik2d6 = ik2d6;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ik2d6", IK2d6ItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ik2d6", IK2d6ActorSheet, {makeDefault: true});
    console.log("ik2d6 | system initialised")
   
});

