import IK2d6ItemSheet from "./module/ik2d6ItemSheet.mjs";

Hooks.once("init", function() {
    console.log("ik2d6 | initialising system")

    Items.unregisterSheet("core", ItemSheet);
    Items.regiesterSheet("ik2d6", IK2d6ItemSheet, {makeDefault: true});

});