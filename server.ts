import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import WebSocket from 'ws';

const server = createServer();
const wss = new WebSocketServer({ server });
const clients = new Set<WebSocket>();

function traduzirDadosCripto(cripto: any) {
    return {
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
    };
}

async function fetchCryptos(page = 1) {
    try {
        const resposta = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=10&page=${page}&sparkline=true`
        );
        if (!resposta.ok) throw new Error('Falha ao buscar dados');

        const dados = await resposta.json();
        return dados.map(traduzirDadosCripto);
    } catch (error) {
        console.error('Erro ao buscar criptomoedas:', error);
        return { error: 'Erro ao buscar criptomoedas.' };
    }
}

async function atualizarDadosCripto() {
    const dadosAtualizados = await fetchCryptos(1);

    clients.forEach((ws) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(dadosAtualizados));
        }
    });
}

setInterval(atualizarDadosCripto, 30000);

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado');
    clients.add(ws);

    const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        }
    }, 30000);

    ws.on('pong', () => {
        console.log('Pong recebido do cliente');
    });

    ws.on('message', async (message) => {
        try {
            const { page } = JSON.parse(message.toString());
            const dados = await fetchCryptos(page || 1);

            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(dados));
            }
        } catch (error) {
            console.error('Erro ao processar mensagem do WebSocket:', error);
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ error: 'Erro ao processar a mensagem.' }));
            }
        }
    });

    ws.on('close', () => {
        clearInterval(pingInterval);
        clients.delete(ws);
        console.log('Cliente desconectado');
        setTimeout(connectToServer, 5000);
    });

    ws.on('error', (error) => {
        console.error('Erro no WebSocket:', error);
        ws.close();
    });
});


function connectToServer() {
    const newWs = new WebSocket('ws://localhost:3001');

    newWs.on('open', () => {
        console.log('Cliente reconectado ao servidor');

    });

    newWs.on('message', (data) => {
        console.log('Mensagem recebida do servidor server.ts:', data.toString());
    });

    newWs.on('error', (error) => {
        console.error('Erro ao reconectar:', error);
        setTimeout(connectToServer, 5000);
    });
}

server.listen(3001, () => {
    console.log('Servidor WebSocket rodando na porta 3001');
});
