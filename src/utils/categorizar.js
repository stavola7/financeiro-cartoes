export const REGRAS = {
  'Alimentacao': ['ifood','ifd','restaurante','pizza','mercado','padaria','lanche'],
  'Transporte': ['uber','99','posto','combustivel','lalamove','clickbus', 'cbus'],
  'Saude': ['farmacia','drogaria','clinica','hospital', 'raia', 'droga'],
  'Lazer': ['cinema','netflix','spotify','steam','kabum','ingresso', 'twitch'],
  'Compras': ['mercadolivre','amazon','shopee','shein','ml'],
  'Assinaturas': ['discord','apple','google','microsoft','adobe'],
  'Viagem': ['airbnb','hotel','booking','latam','gol','azul'],
  'Pagamento': ['pagamento','pagto','estorno','anuidade'],
  'Moradia': ['condominio','aluguel','energia','agua','lavanderia'],
}

export function categorizar(descricao) {
  const desc = descricao.toLowerCase()
  for (const [cat, keywords] of Object.entries(REGRAS)) {
    if (keywords.some(k => desc.includes(k))) return cat
  }
  return 'Outros'
}
