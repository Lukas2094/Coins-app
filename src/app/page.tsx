import CryptoTable from "@/components/CryptoCard/CryptoCard";
import Link from "next/link";

interface Busca {
  searchParams: any;
}

// Função para buscar as criptomoedas da API
async function getCryptos(pagina = 1) {
  const resposta = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=15&page=${pagina}&sparkline=true`
  );
  if (!resposta.ok) {
    throw new Error('Falha ao buscar dados da API');
  }
  const dados = await resposta.json();
  return dados.map((cripto: any) => ({
    id: cripto.id,
    nome: cripto.name,
    simbolo: cripto.symbol.toUpperCase(),
    preco_atual: cripto.current_price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    capitalizacao_mercado: cripto.market_cap.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    volume_total: cripto.total_volume.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    variacao_percentual_24h: cripto.price_change_percentage_24h?.toFixed(2) + '%',
    imagem: cripto.image,
    sparkline_in_7d: cripto.sparkline_in_7d,
  }));
}

export default async function Home({ searchParams }: Busca) {
  const pagina = searchParams.page || 1;

  // Busca as criptos com base na página
  const cryptosIniciais = await getCryptos(pagina);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-5xl font-bold mb-4">Principais Criptomoedas por Capitalização de Mercado</h1>
      <CryptoTable cryptosIniciais={cryptosIniciais} pagina={pagina} />

      <div className="flex justify-center mt-4">
        <Link         
          href={`/?page=${parseInt(pagina.toString()) - 1}`}
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Anterior
        </Link>
        <Link
          href={`/?page=${parseInt(pagina.toString()) + 1}`}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}
