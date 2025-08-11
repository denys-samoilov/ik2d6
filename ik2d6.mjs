import IK2d6ActorSheet from "./module/sheets/ik2d6CharacterSheet.mjs";
import IK2d6ItemSheet from "./module/sheets/ik2d6ItemSheet.mjs";

Hooks.once("init", function() {
    console.log("ik2d6 | initialising system")

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("ik2d6", IK2d6ItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ik2d6", IK2d6ActorSheet, {makeDefault: true});
    console.log("ik2d6 | system initialised")
   
});

