export default class IK2d6ActorSheet extends ActorSheet {
    get template() {
    return `systems/ik2d6/templates/sheets/${this.actor.type}-sheet.html`;
  }
}