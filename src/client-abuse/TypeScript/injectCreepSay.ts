/**
 * Creep Say client abuse
 * Posted 2022-02-12 by poot
 * Thanks to semperrabbit for the templates and examples
 *
 * Adds a row to the right sidebar when a creep is selected,
 * allowing you to instruct creeps to say things on-demand from the client.
 *
 * Import into main.ts with `import 'injectCreepSay';`
 * This will call `global.injectCreepSay()` every global reset,
 * and can be forced by calling `forceInjectCreepSay()` from the game CLI
 */

declare var global: any;
declare var angular: any;
declare var $: any;

type SelectedObject = {
  _id: string;
  x: number;
  y: number;
} & {
  type: 'creep';
  name: string;
  user: string;
};

//! This function must have no dependencies outside of the function body since it gets stringified
function INJECT_ME() {
  const STYLES = `<style>
  .first-tag-is-not-getting-applied-for-some-reason-dont-remove-this {
    test: test;
  }

  #say-row {
    display: flex;
    margin-bottom: 5px;
  }

  #say-text,
  #say-public + label,
  #say-submit {
    padding: 4px;
    border: 1px solid #444;
    border-radius: 4px;
  }

  #say-text:focus,
  #say-public:focus-visible + label,
  #say-submit:focus-visible {
    outline: 1px solid #aaa;
  }

  #say-text {
    background-color: transparent;
    min-width: 0px;
    color: #aaa;
  }


  #say-public {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  #say-public + label {
    margin: 0 5px;
    color: #444;
    background-color: #aaa;
    text-decoration: line-through;
    cursor: pointer;
  }

  #say-public:checked + label {
    background-color: #dd8888;
    text-decoration: none;
  }

  #say-submit {
    background-color: #444;
    border: none;
  }
  </style>`;

  if (window._injectCreepSayInstalled) {
    console.info(
      '[injectCreepSay]: Already ran injection script, reload page first'
    );
    return;
  }

  window._injectCreepSayInstalled = true;
  const [, page] = window.location.hash.split('/');

  /* Ensure we are in room view */
  if (page !== 'room') return;

  if (!window._userId) {
    window._userId = angular.element(document.body).scope().Me()._id;
  }

  /* Append CSS stylesheet to head */
  if (!$('#creep-say-styles')[0]) {
    const css = document.createElement('style');
    css.id = 'creep-say-styles';
    css.appendChild(document.createTextNode(STYLES));
    document.head.appendChild(css);
  }

  /* Add handler to add elements to sidebar and assign listeners when selected object changes */
  angular
    .element($('.room.ng-scope'))
    .scope()
    .$watch('Room.selectedObject', onSelectedObjectChange);

  function onSelectedObjectChange(selectedObject: SelectedObject | null): void {
    if (!selectedObject) return;

    let sayForm = $('.creep-say')[0];

    if (
      !selectedObject ||
      selectedObject.type !== 'creep' ||
      selectedObject.user !== window._userId
    ) {
      if (sayForm) {
        sayForm.parentNode.removeChild(sayForm);
      }

      return;
    }

    if (sayForm) {
      return;
    }

    sayForm = document.createElement('form');
    sayForm.classList.add('creep-say', 'body');

    sayForm.addEventListener('submit', (e: any) => {
      e.preventDefault();
      const textEl = $('#say-text')[0];
      const isPublic = $('#say-public')[0].checked;
      if (!textEl.value) return;

      angular
        .element(document.body)
        .injector()
        .get('Connection')
        .sendConsoleCommand(
          `_sayCreep = Game.creeps["${selectedObject.name}"]; _sayCreep && _sayCreep.say("${textEl.value}", ${isPublic});`
        );

      textEl.value = '';
    });

    sayForm.innerHTML = `
       <label class="body-header">Creep.say()</label>
       <div id="say-row">
       <input type="text" id="say-text" maxlength="10" required />
       <input type="checkbox" id="say-public" />
       <label for="say-public">Public</label>
       <button type="submit" id="say-submit">💬</button>
       </div>`;

    /*
     * Append to sidebar before "Notify me when attacked" checkbox.
     * Use poll interval since we need to wait for Angular to update the DOM first
     */
    const interval = setInterval(() => {
      const lastRow = $('.aside-block-content .body:last-of-type')[0];
      if (!lastRow) return;

      if (lastRow.nextSibling) {
        lastRow.parentNode.insertBefore(sayForm, lastRow.nextSibling);
      } else {
        lastRow.parentNode.appendChild(sayForm);
      }

      clearInterval(interval);
    }, 50);
  }
}

function injectCreepSay() {
  if (!global._creepSayInjected) {
    global._creepSayInjected = true;
    const output = `<span>Trying to inject CreepSay code!</span><script>(${INJECT_ME.toString()})()</script>`;
    console.log(
      output.replace(/(\r\n|\n|\r)\t+|(\r\n|\n|\r) +|(\r\n|\n|\r)/gm, '')
    );
  }
}

/* Call from game CLI to force inject if browser wasn't open during last global reset */
global.forceInjectCreepSay = () => {
  global._creepSayInjected = false;
  injectCreepSay();
};

/* Inject on global reset so it's done automatically when debugging */
injectCreepSay();
