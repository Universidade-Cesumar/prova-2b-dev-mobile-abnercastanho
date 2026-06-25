export function validarRetirada(quantidadeAtual, quantidadeRetirar) {
  if (isNaN(quantidadeAtual) || isNaN(quantidadeRetirar)) return false;
  if (quantidadeRetirar <= 0) return false;
  if (quantidadeRetirar > quantidadeAtual) return false;
  return true;
}