import { initWizardNav } from './navigation.js';
import { renderStep1 } from './steps/step1-event.js';
import { renderStep2 } from './steps/step2-datum.js';
import { renderStep3 } from './steps/step3-ort.js';
import { renderStep4 } from './steps/step4-gaeste.js';
import { renderStep5 } from './steps/step5-zutaten.js';
import { renderStep6 } from './steps/step6-setup.js';
import { renderStep7 } from './steps/step7-kontakt.js';
import { renderStep8 } from './steps/step8-uebersicht.js';
import { qs } from '../lib/dom.js';

const RENDERERS = [null, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8];

export function initWizard() {
  const stage = qs('#wizard-stage');
  if (!stage) return;
  initWizardNav({
    onStepChange: (s) => {
      const fn = RENDERERS[s.step];
      if (fn) fn(stage);
    },
  });
}
