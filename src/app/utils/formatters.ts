export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarDataLocal(dataIso: string | null | undefined): string {
  if (!dataIso) return "-";

  const data = new Date(dataIso);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}
