/**
 * Valida se a quantidade de retirada é permitida com base no estoque atual.
 */
export function validarRetirada(estoqueAtual, quantidadeRetirada) {
  const atual = Number(estoqueAtual);
  const retirada = Number(quantidadeRetirada);

  if (isNaN(atual) || isNaN(retirada) || retirada <= 0 || retirada > atual) {
    return false;
  }
  return true;
} 