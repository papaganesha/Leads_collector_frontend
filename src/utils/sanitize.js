export function sanitizeCityInput(cityInput) {
  if (!cityInput) return '';

  // Limpa espaços extras
  let cleaned = cityInput.trim().replace(/\s+/g, ' ');

  // Lista de siglas de estados brasileiros
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Identifica padrões como "- RS", ", RS" ou " RS" no final
  const ufRegex = new RegExp(`[-,\\s]+(${ufs.join('|')})$`, 'i');
  const match = cleaned.match(ufRegex);

  if (match) {
    const ufFound = match[1].toUpperCase();
    const cityNameOnly = cleaned.replace(ufRegex, '').trim();
    cleaned = `${capitalizeWords(cityNameOnly)}, ${ufFound}, Brasil`;
  } else {
    cleaned = `${capitalizeWords(cleaned)}, Brasil`;
  }

  return cleaned;
}

function capitalizeWords(str) {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (a) => a.toUpperCase());
}
