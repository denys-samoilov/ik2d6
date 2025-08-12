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

    // Handle item deletion
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });
    
    // Handle item editing
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);
      if (item) {
        item.sheet.render(true);
      }
    });

    // Handle attack rolls
    html.find('.roll-attack').click(async ev => {

      if(!game.user.targets.size) {
        ui.notifications.warn("Shooting, huh? You need to select a target first!");
        return;
      }
      

      const li = $(ev.currentTarget).closest('.actor-item');
      const itemId = li.data('item-id');
      const item = this.actor.items.get(itemId);

      // Initializing target actor
      const targets = Array.from(game.user.targets);
      const targetToken = targets[0];
      const targetActor = targetToken.actor;

      // Getting modifiers and pow
      const attModifier = item.system.attModifier || 0;
      const pow = item.system.pow || 0;

      // Getting boosted attack and damage checkboxes
      const boostedAtt = li.find('.boost-att-checkbox').is(':checked');
      const boostedDmg = li.find('.boost-dmg-checkbox').is(':checked');

      // Attack roll
      let attDice = boostedAtt ? 3 : 2;
      let attackRoll = new Roll(`${attDice}d6 + ${attModifier}`);
      await attackRoll.evaluate({async: true});


      // Sending attack roll message
      attackRoll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${item.name} Attack Roll (${attDice}d6${boostedAtt ? ' Boosted' : ''})`
      });

      // Delay to simulate roll animation
      await new Promise(resolve => setTimeout(resolve, 3000));


      if (attackRoll.total < 7) {
        ui.notifications.info(`${this.actor.name} shoots ${targetActor.name}... but misses!`);
        return; // Exit early if no damage roll is needed
      }
      else {
        ui.notifications.info(`${this.actor.name} shoots ${targetActor.name} and hits!`);   
      }

      // Damage roll
      let dmgDice = boostedDmg ? 3 : 2;
      let damageRoll = new Roll(`${dmgDice}d6 + ${pow}`);
      await damageRoll.evaluate({async: true});

        

      damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${item.name} Damage Roll (${dmgDice}d6${boostedDmg ? ' Boosted' : ''})`,
      });

      // Check if there are at least two same dice in the damage roll
      const diceResults = damageRoll.dice[0].results;
      const hasPair = diceResults.some((result, index) => 
        diceResults.slice(index + 1).some(otherResult => 
          result.result === otherResult.result
        )
      );
      
      // If there is a pair, notify the user
      if (hasPair) {
        ui.notifications.info(`${this.actor.name} deals critical damage to ${targetActor.name}!`);
      }

      // Delay to simulate roll animation
      await new Promise(resolve => setTimeout(resolve, 3000));


      // If damage > 15, reduce HP of targeted token
      if (damageRoll.total > 15) {
        if (targets.length > 0) {
          const armor = 15; // or use your actual armor property
          const effectiveDamage = Math.max(damageRoll.total - armor, 0);
          const currentHp = getProperty(targetActor, "system.hp") || 0;
          const newHp = Math.max(currentHp - effectiveDamage, 0);
          await targetActor.update({"system.hp": newHp});
          ui.notifications.info(`Target ${targetActor.name} takes damage! HP reduced.`);
        } 
      }
});

   
};
}
