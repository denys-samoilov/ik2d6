export default class IK2d6ItemSheet extends ItemSheet {
    get template() {
    return `systems/ik2d6/templates/sheets/${this.item.type}-sheet.html`;
  }
}