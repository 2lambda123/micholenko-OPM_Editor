/* 
 * Author: Michal Zavadil, Brno University of Technology - Faculty of Information Technology
 * Copyright: Copyright 2022, OPM Editor
 * Made for Bachelor's Thesis - Agile Model Editor
 * License: MIT
*/

import { Core } from "cytoscape";
import tippy from "tippy.js";


const nodeLabelEditingPopup = (cy: Core) => {
  cy.on('dbltap', 'node', (evt: any) => {
    const targetNode = evt.target;
    let ref = targetNode.popperRef();
    let dummyDomEle = document.createElement('div');
    document.body.appendChild(dummyDomEle);
    let tip = tippy(dummyDomEle, { // tippy props:
      getReferenceClientRect: ref.getBoundingClientRect, // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
      trigger: 'manual', // mandatory, we cause the tippy to show programmatically.
      placement: 'bottom',
      interactive: true,
      // your own custom props
      // content prop can be used when the target is a single element https://atomiks.github.io/tippyjs/v6/constructor/#prop
      content: () => {
        let content = document.createElement('div');
        content.classList.add('renameDialog')

        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = targetNode.data('label');
        inputElement.classList.add('labelInput');
        let newLabel = inputElement.value;

        inputElement.addEventListener("change", function (event) {
          // @ts-ignore
          newLabel = event.target.value;
        });
        inputElement.classList.add('display-block');
        content.appendChild(inputElement);

        const buttonConfirm = document.createElement('button');
        buttonConfirm.type = 'button';
        // buttonConfirm.classList.add('btn', 'btn-default');
        buttonConfirm.innerHTML = "Ok";
        buttonConfirm.addEventListener("click", function (event) {
          event.preventDefault();
          targetNode.data({ label: newLabel });
          const newLabelWidth = newLabel.length * 8.5 > 60 ?  newLabel.length  * 8.5 : 60
          targetNode.data({ labelWidth: newLabelWidth });
          targetNode.data('MMRef').label = newLabel;
          tip.hide();
          
        });

        content.appendChild(buttonConfirm);

        const buttonCancel = document.createElement('button');
        buttonCancel.type = 'button';
        buttonCancel.innerHTML = "Cancel";
        buttonCancel.addEventListener("click", function (event) {
          event.preventDefault();
          tip.hide();
        });
        content.appendChild(buttonCancel);
        return content;
      },
    });
    tip.show();
  });
};

const edgeLabelEditingPopup = (cy: Core) => {
  cy.on('dbltap', 'edge', (evt: any) => {
    const targetEdge = evt.target;
    let ref = targetEdge.popperRef();
    let dummyDomEle = document.createElement('div');
    document.body.appendChild(dummyDomEle);
    let tip = tippy(dummyDomEle, { // tippy props:
      getReferenceClientRect: ref.getBoundingClientRect, // https://atomiks.github.io/tippyjs/v6/all-props/#getreferenceclientrect
      trigger: 'manual', // mandatory, we cause the tippy to show programmatically.
      placement: 'bottom',
      interactive: true,
      // your own custom props
      // content prop can be used when the target is a single element https://atomiks.github.io/tippyjs/v6/constructor/#prop
      content: () => {
        let content = document.createElement('div');
        content.classList.add('renameDialog')

        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.value = targetEdge.data('label');
        let newLabel = inputElement.value;

        inputElement.addEventListener("change", function (event) {
          // @ts-ignore
          newLabel = event.target.value;
        });
        inputElement.classList.add('display-block');
        content.appendChild(inputElement);

        const buttonConfirm = document.createElement('button');
        buttonConfirm.type = 'button';
        // buttonConfirm.classList.add('btn', 'btn-default');
        buttonConfirm.innerHTML = "Ok";
        buttonConfirm.addEventListener("click", function (event) {
          event.preventDefault();
          targetEdge.data({ label: newLabel });
          const MMRef = targetEdge.data('MMRef')
          MMRef.label = newLabel;
          if (MMRef.originalEdges.length)
            MMRef.originalEdge.label = newLabel;
            
          tip.hide();
        });
        buttonConfirm.classList.add('tippyButton');

        content.appendChild(buttonConfirm);

        const buttonCancel = document.createElement('button');
        buttonCancel.type = 'button';
        buttonCancel.classList.add('tippyButton');
        buttonCancel.innerHTML = "Cancel";
        buttonCancel.addEventListener("click", function (event) {
          event.preventDefault();
          tip.hide();
        });
        content.appendChild(buttonCancel);
        return content;
      },
    });
    tip.show();
  });
};

export { nodeLabelEditingPopup, edgeLabelEditingPopup };
