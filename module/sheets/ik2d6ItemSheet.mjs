export default class IK2d6ItemSheet extends ItemSheet {
    get template() {
    return `systems/ik2d6/templates/sheets/${this.item.type}-sheet.html`;
  }

  getData() {
  const data = super.getData();
  data.config = CONFIG.ik2d6; // Make config available in template
  return data;
}

getData() {
    const data = super.getData();
    data.config = CONFIG.ik2d6;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.roll-attack').click(async ev => {
    const attModifier = this.item.system.attModifier || 0;
    const roll = new Roll(`2d6 + ${attModifier}`);
    await roll.evaluate({async: true});
    roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor: this.actor}),
    flavor: `${this.item.name} Attack Roll`
  });
});
}}