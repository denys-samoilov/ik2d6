export default class IK2d6ItemSheet extends ItemSheet {
    get template() {
    return `systems/ik2d6/templates/sheets/${this.item.type}-sheet.html`;
  }

  getData() {
  const data = super.getData();
  data.config = CONFIG.ik2d6; // Make config available in template
  return data;
}
}