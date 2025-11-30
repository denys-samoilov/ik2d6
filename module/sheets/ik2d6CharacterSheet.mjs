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

    html.find('.check-json').click(ev => {
      this._onCheckJson(ev);
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

    html.find('.recalculate-armor').click(ev => {
      this._onRecalculateArmor(ev);
    });

    // Handle attack rolls
    html.find('.roll-ranged-attack, .roll-melee-one-hand-attack, .roll-melee-two-hand-attack').click(ev => {
      const button = $(ev.currentTarget);
      const attModifier = Number(button.data('att-modifier')) || 0;
      const pow = Number(button.data('pow')) || 0;
      this._onRoll(ev, attModifier, pow);
    });

    html.find('.dev-switch').click(ev => {
      const enabled = $(ev.currentTarget).find('input').is(':checked');

      html.find('.dev-mode')
      .prop('disabled', !enabled)  
    });

    html.find('.dev-mode').prop('disabled', true); // Disable the input field by default
  }

  // Attack rolls function
  async _onRoll(event, attModifier, pow) {
    event.preventDefault();

    // Target check
    if (!game.user.targets.size) {
      ui.notifications.warn("Attacking, huh? You need to select a target first!");
      return;
    }

    if (game.user.targets.size>1) {
      ui.notifications.warn("Did you really mean to attack multiple targets at once? Please select only one target.");
      return;
    }

    // Item check
    const li = $(event.currentTarget).closest('.actor-item');
    const itemId = li.data('item-id');
    const item = this.actor.items.get(itemId);


    // Check if item is a melee weapon
    if(item.type == "melee-weapon") {
      pow += Number(this.actor.system.str);
    }


    // Target initialization
    const targets = Array.from(game.user.targets);
    const targetToken = targets[0];
    const targetActor = targetToken.actor;

    // Boost elements initialization
    const boostedAtt = li.find('.boost-att-checkbox').is(':checked');
    const boostedDmg = li.find('.boost-dmg-checkbox').is(':checked');

    // Attack roll initialization
    let attDice = boostedAtt ? 3 : 2;
    let attackRoll = new Roll(`${attDice}d6 + ${attModifier}`);
    await attackRoll.evaluate({ async: true });

    // Attack roll message
    attackRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${item.name} ${item.type.capitalize()} Attack Roll (${attDice}d6${boostedAtt ? ' Boosted' : ''})`
    });

    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Attack result check
    if (attackRoll.total < targetActor.system.def) {
      ui.notifications.info(`${this.actor.race} ${this.actor.name} attacks ${targetActor.name}... but misses!`);
      return;
    } else {
      ui.notifications.info(`${this.actor.name} attacks ${targetActor.name} and hits!`);
    }

    // Critical hit check
    const diceResults = attackRoll.dice[0].results;
    const hasPair = diceResults.some((result, index) =>
      diceResults.slice(index + 1).some(otherResult =>
        result.result === otherResult.result
      )
    );

    // Critical hit message
    if (hasPair) {
      ui.notifications.info(`${this.actor.name} deals critical hit to ${targetActor.name}!`);
    } 

    // Damage roll initialization
    let dmgDice = boostedDmg ? 3 : 2;
    let damageRoll = new Roll(`${dmgDice}d6 + ${pow}`);
    await damageRoll.evaluate({ async: true });

    // Damage roll message
    damageRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${item.name} Damage Roll (${dmgDice}d6${boostedDmg ? ' Boosted' : ''})`,
    });

    // Wait for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Damage result check
    if (damageRoll.total > targetActor.system.arm) {
      const armor = targetActor.system.arm; 
      const effectiveDamage = damageRoll.total - armor;
      const currentHp = Number(getProperty(targetActor, "system.hp"));
      const newHp = Math.max(currentHp - effectiveDamage, 0);
      await targetActor.update({ "system.hp": newHp });
      ui.notifications.info(`Target ${targetActor.name} takes damage! HP reduced.`);
    }
  }

  _onRecalculateArmor(event) {
    event.preventDefault();
    const li = $(event.currentTarget).closest('.actor-item');
    const itemId = li.data('item-id');

    const item = this.actor.items.get(itemId);
    if (item.type == "armor") {
      const spdModifier = Number(item.system.spdModifier);
      const defModifier = Number(item.system.defModifier);
      const armModifier = Number(item.system.armModifier);
      const currentPhy = Number(this.actor.system.phy);
      const currentSpd = Number(this.actor.system.spd);
      const currentAgl = Number(this.actor.system.agi);
      const currentPer = Number(this.actor.system.per);

      const newDef = currentSpd + currentAgl + currentPer + defModifier;
      const newArm = currentPhy + armModifier;
      this.actor.update({ "system.def": newDef });
      this.actor.update({ "system.arm": newArm });
    }
  }

async _onCheckJson(event) {
  event.preventDefault();

  const data = await fetch("systems/ik2d6/bases/race.json");

  const racesData = await data.json();

  const actorRace = this.actor.system.race;

  const raceName = racesData[actorRace].name;
  const phy = racesData[actorRace].phy_start;
  const agi = racesData[actorRace].agl_start;
  const int = racesData[actorRace].int_start;


  this.actor.update({ "system.race": raceName });
  this.actor.update({ "system.phy": phy });
  this.actor.update({ "system.agi": agi });
  this.actor.update({ "system.int": int });

  console.log("Name:", raceName);
  console.log("Phy:", phy);
  console.log("Agi:", agi);
  console.log("Int:", int);
}






}



