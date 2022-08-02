import "./index.css";
import { Engine, Scene, Vector3, HemisphericLight, Mesh, FollowCamera } from "@babylonjs/core";
import Keycode from "keycode.js";
import { StateHandler, PressedKeys } from "../server/rooms/StateHandler";
import { Client } from "colyseus.js";

const PROTOCOL = window.location.protocol.replace("http", "ws");

const ENDPOINT = (window.location.hostname.indexOf("heroku") >= 0 || window.location.hostname.indexOf("now.sh") >= 0 )
    ? `${ PROTOCOL }//${ window.location.hostname }` 
    : `${ PROTOCOL }//${ window.location.hostname }:2657` // port 2657 on localhost

const client = new Client(ENDPOINT);

const canvas = document.getElementById('game') as HTMLCanvasElement;
const engine = new Engine(canvas, true);

var scene = new Scene(engine);

var camera = new FollowCamera("camera1", new Vector3(0, 5, -10), scene);

camera.setTarget(Vector3.Zero());

camera.attachControl(true);

var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

light.intensity = 0.7;

// var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene);


// Colyseus / Join Room
client.joinOrCreate<StateHandler>("room_play").then(room => {
    const playerViews: {[id: string]: Mesh} = {};

    room.state.players.onAdd = function (player, key) {
        
        playerViews[key] = Mesh.CreateSphere("sphere1", 16, 2, scene);

        playerViews[key].position.set(player.position.x, player.position.y, player.position.z);

        player.position.onChange = () => {
            playerViews[key].position.set(player.position.x, player.position.y, player.position.z);
        };

        // Set camera to follow current player
        if (key === room.sessionId) {
            camera.setTarget(playerViews[key].position);
        }
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key]);
        delete playerViews[key];
    };

    room.onStateChange((state) => {
        console.log("New room state:", state.toJSON());
    });

    // Keyboard listeners
    const keyboard: PressedKeys = { x: 0, y: 0 };
    window.addEventListener("keydown", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = -1;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 1;
        } else if (e.which === Keycode.UP) {
            keyboard.y = -1;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 1;
        }
        room.send('key', keyboard);
    });

    window.addEventListener("keyup", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.UP) {
            keyboard.y = 0;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 0;
        }
        room.send('key', keyboard);
    });

    // Resize the engine on window resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

// Scene render loop
engine.runRenderLoop(function() {
    scene.render();
});
