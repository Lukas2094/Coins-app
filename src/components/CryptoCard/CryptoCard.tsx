'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparklines, SparklinesLine, SparklinesReferenceLine } from 'react-sparklines';

interface Crypto {
    id: string;
    nome: string;
    simbolo: string;
    preco_atual: string;
    capitalizacao_mercado: string;
    volume_total: string;
    variacao_percentual_24h: string;
    imagem: string;
    sparkline_in_7d: {
        price: number[];
    };
}

interface CryptoTableProps {
    cryptosIniciais: Crypto[];
    pagina: number;
}

export default function CryptoTable({ cryptosIniciais, pagina }: CryptoTableProps) {
    const [cryptos, setCryptos] = useState<Crypto[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!wsRef.current) {
            const ws = new WebSocket('ws://localhost:3001');
            wsRef.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({ page: pagina }));
            };

            ws.onmessage = (event) => {
                // console.log('Mensagem recebida do servidor crypto:', event.data);
                const dados = JSON.parse(event.data);
                setCryptos(dados);
            };

            ws.onerror = (error) => {
                console.error('Erro no WebSocket:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket desconectado');
            };
        } else {
            wsRef.current.send(JSON.stringify({ page: pagina }));
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [pagina]);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Criptomoeda</th>
                        <th className="py-3 px-6 text-left">Símbolo</th>
                        <th className="py-3 px-6 text-left">Preço</th>
                        <th className="py-3 px-6 text-left">Capitalização de Mercado</th>
                        <th className="py-3 px-6 text-left">Volume (24h)</th>
                        <th className="py-3 px-6 text-left">Variação (24h)</th>
                        <th className="py-3 px-6 text-left">Gráfico (7 dias)</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {cryptos.map((crypto, index) => {
                        const variacao = parseFloat(crypto.variacao_percentual_24h);
                        const corGrafico = variacao >= 0 ? 'green' : 'red';
                        const corLinha = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

                        return (
                            <tr key={crypto.id} className={`${corLinha} border-b border-gray-200 hover:bg-gray-100`}>
                                <td className="py-3 px-6 text-left whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="w-6 h-6 mr-2" src={crypto.imagem} alt={crypto.nome} />
                                        <span>{crypto.nome}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-6 text-left">{crypto.simbolo.toUpperCase()}</td>
                                <td className="py-3 px-6 text-left">{crypto.preco_atual}</td>
                                <td className="py-3 px-6 text-left">{crypto.capitalizacao_mercado}</td>
                                <td className="py-3 px-6 text-left">{crypto.volume_total}</td>
                                <td className="py-3 px-6 text-left">
                                    <span style={{ color: corGrafico }}>{crypto.variacao_percentual_24h}</span>
                                </td>
                                <td className="py-3 px-6 text-left">
                                    <div className="w-32">
                                        <Sparklines data={crypto.sparkline_in_7d.price} width={100} height={30}>
                                            <SparklinesLine color={corGrafico} />
                                            <SparklinesReferenceLine type="mean" />
                                        </Sparklines>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};