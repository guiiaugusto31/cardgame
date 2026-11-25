# Masmorra dos Ecos — servidor

Serve o jogo (public/index.html) e as salas online (WebSocket) na mesma porta.

    npm install
    npm start            # http://localhost:8080

Variáveis: PORT, DATA_FILE (ranking/contas, JSON). Na Render: Web Service, Build `npm install`, Start `npm start`,
e um Disco persistente apontando DATA_FILE para ele (senão o ranking zera a cada deploy).
Abra o jogo pelo endereço do servidor e use 🌐 Online.
