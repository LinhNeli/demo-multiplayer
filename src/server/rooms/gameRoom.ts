import { Room, Client } from "colyseus";

import { StateHandler, Player } from "./StateHandler";

export class GameRoom extends Room<StateHandler> {
    maxClients = 6;

    onCreate (options: any) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler());

        this.onMessage("key", (client, message) => {
            this.state.players.get(client.sessionId).pressedKeys = message;
        });
    }

    onJoin (client: Client) {
        const player = new Player();
        player.name = `Player ${ this.clients.length }`;
        player.position.x = Math.random();
        player.position.y = Math.random();
        player.position.z = Math.random();

        this.state.players.set(client.sessionId, player);
    }

    onUpdate () {
        this.state.players.forEach((player, sessionId) => {
            player.position.x += player.pressedKeys.x * 0.1;
            player.position.z -= player.pressedKeys.y * 0.1;
        });
    }

    onLeave (client: Client) {
        this.state.players.delete(client.sessionId);
    }

    onDispose () {
    }

}
