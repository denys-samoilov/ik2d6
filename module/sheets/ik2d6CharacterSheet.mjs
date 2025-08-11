export default class IK2d6ActorSheet extends ActorSheet {
    get template() {
    return `systems/ik2d6/templates/sheets/${this.actor.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();
    data.config = CONFIG.ik2d6;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);
      if (item) {
        item.sheet.render(true);
      }
    });


    html.find('.roll-attack').click(async ev => {
      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);

      const attModifier = item.system.attModifier || 0;
      const pow = item.system.pow || 0;

      const boostedAtt = html.find('.boost-att-checkbox').is(':checked');
      const boostedDmg = html.find('.boost-dmg-checkbox').is(':checked');

      // Attack roll
      let dice = boostedAtt ? 3 : 2;
      let roll = new Roll(`${dice}d6 + ${attModifier}`);
      await roll.evaluate({async: true});
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${item.name} Attack Roll (${dice}d6${boostedAtt ? ' Boosted' : ''})`
      });

      // Damage roll
      dice = boostedDmg ? 3 : 2;
      roll = new Roll(`${dice}d6 + ${pow}`);
      await roll.evaluate({async: true});
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${item.name} Damage Roll (${dice}d6${boostedDmg ? ' Boosted' : ''})`
  });
});

    html.find('.roll-damage-ranged').click(async ev => {
      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);
      const pow = item.system.pow || 0;
      const roll = new Roll(`2d6 + ${pow}`);
      await roll.evaluate({async: true});
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${item.name} Attack Roll`
  });
});
};
}
