export function validateStep(step, state) {
  const errors = [];
  switch (step) {
    case 1:
      if (!state.eventType) errors.push({ field: 'eventType', msg: 'Art des Anlasses wählen.' });
      break;
    case 2:
      if (!state.date) errors.push({ field: 'date', msg: 'Datum setzen.' });
      if (state.date && new Date(state.date) < new Date(new Date().toDateString())) {
        errors.push({ field: 'date', msg: 'Datum liegt in der Vergangenheit.' });
      }
      if (!state.time) errors.push({ field: 'time', msg: 'Uhrzeit setzen.' });
      if (!state.duration) errors.push({ field: 'duration', msg: 'Dauer wählen.' });
      break;
    case 3:
      if (!state.address) errors.push({ field: 'address', msg: 'Event-Ort angeben.' });
      break;
    case 4:
      if ((state.adults + state.children) === 0) errors.push({ field: 'adults', msg: 'Mindestens ein Gast.' });
      break;
    case 5:
      if (state.toppings.length < 1) errors.push({ field: 'toppings', msg: 'Mindestens eine Zutat wählen.' });
      if (state.toppings.length > 6) errors.push({ field: 'toppings', msg: 'Maximal sechs Zutaten.' });
      break;
    case 6:
      // sanfte Warnung, keine Blockade
      break;
    case 7:
      if (!state.name) errors.push({ field: 'name', msg: 'Name angeben.' });
      if (!state.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) errors.push({ field: 'email', msg: 'Gültige E-Mail angeben.' });
      if (!state.phone || state.phone.replace(/\D/g, '').length < 8) errors.push({ field: 'phone', msg: 'Telefonnummer angeben.' });
      break;
    case 8:
      // Finale Prüfung: alle vorigen
      for (let s = 1; s <= 7; s++) errors.push(...validateStep(s, state));
      break;
  }
  return errors;
}

export function canAdvance(step, state) {
  // Wizard blockiert nicht hart, aber Summary zeigt Lücken. Advance immer erlaubt ausser Step 7 ohne Kontakt.
  if (step === 7) return validateStep(7, state).length === 0;
  return true;
}
