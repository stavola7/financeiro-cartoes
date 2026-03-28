const REGRAS = {
  'Alimentacao': ['ifood','ifd','restaurante','pizza','mercado','padaria','lanche','grão','grao','sabor',
  'terepizza','marmita','sushi','cafe','conde','gran','gourmet','conde gourmet','gran coffee','coffee', 'santa ceia', 'ceia','salamix'],
  'Transporte': ['uber','99','posto','combustivel','lalamove','clickbus','clic','onibus'],
  'Saude': ['farmacia','drogaria','clinica','hospital','odonto','unimed','amil'],
  'Lazer': ['cinema','netflix','spotify','disney','prime','hbo','steam','kabum','ingresso','bar'],
  'Compras': ['mercadolivre','amazon','shopee','shein','magazine','americanas','micromark'],
  'Assinaturas': ['discord','apple','google','microsoft','adobe','notion','icloud','melimais'],
  'Viagem': ['airbnb','hotel','pousada','booking','latam','gol','azul'],
  'Pagamento': ['pagamento','pagto','estorno','anuidade','saldo anterior','pix cred'],
  'Moradia': ['condominio','aluguel','energia','agua','internet','lavanderia'],
  'Educacao': ['escola','curso','alura','udemy','faculdade'],
}

export function categorizar(descricao) {
  const desc = (descricao || '').toLowerCase()
  for (const [cat, keywords] of Object.entries(REGRAS)) {
    if (keywords.some(k => desc.includes(k))) return cat
  }
  return 'Outros'
}

export const CATEGORIAS = [
  { nome: 'Alimentacao', cor: '#F97316', icone: '🍔' },
  { nome: 'Transporte', cor: '#3B82F6', icone: '🚗' },
  { nome: 'Saude', cor: '#10B981', icone: '🏥' },
  { nome: 'Lazer', cor: '#8B5CF6', icone: '🎮' },
  { nome: 'Compras', cor: '#EC4899', icone: '🛍️' },
  { nome: 'Assinaturas', cor: '#14B8A6', icone: '📱' },
  { nome: 'Viagem', cor: '#F43F5E', icone: '✈️' },
  { nome: 'Pagamento', cor: '#6B7280', icone: '💳' },
  { nome: 'Moradia', cor: '#6366F1', icone: '🏠' },
  { nome: 'Educacao', cor: '#F59E0B', icone: '📚' },
  { nome: 'Mari', cor: '#E879F9', icone: '💁‍♀️' },
  { nome: 'Outros', cor: '#9CA3AF', icone: '📦' },
]

export function getCatInfo(nome) {
  return CATEGORIAS.find(c => c.nome === nome) || CATEGORIAS[CATEGORIAS.length - 1]
}