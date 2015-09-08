/// <reference path="../typings/tsd.d.ts" />

module RobotServer{
    export enum NeighborTypeEnum{
        video = 1,
        data = 2
    }

    export class Neighbor extends EventEmitter2{
        private _dataChannel: PeerJs.DataConnection = null;
        private _mediaConnection: PeerJs.MediaConnection = null;
        public connected = false;
        public OnDataReceivedEvent = "DataFromNeighbor";
        public OnMediaReceivedEvent = "MediaFromNeighbor";

        constructor(public peerID: string, public neighborType: NeighborTypeEnum){
            super();
        }

        setDataChannel(dataChannel: PeerJs.DataConnection){
            this._dataChannel = dataChannel;
            this.connected = false;

            dataChannel.on('open', ()=>{
                console.log("onopen========");
                console.log(this.peerID);
                this.connected = true;
                console.log(this.connected);
            });

            dataChannel.on('close', ()=>{
                this.removeDataChannel();
                console.log("false1========");
                this.connected = false;
            });

            dataChannel.on('error', (error)=>{
                this.removeDataChannel();
                console.log("false2========");
                this.connected = false;
            });

            dataChannel.on('data', (data)=>{
                this.emit(this.OnDataReceivedEvent, data);
            });
        }

        setMediaConnetion(call: PeerJs.MediaConnection){
            this._mediaConnection = call;
            this.connected = false;

            call.on('stream', (stream)=>{
                this._mediaConnection = stream;
                this.connected = true;
                this.emit(this.OnMediaReceivedEvent, stream);
            });

            call.on('close', ()=>{
                this.removeDataChannel();
                this.connected = false;
            });

            call.on('error', (error)=>{
                this.connected = false;
            });
        }

        removeDataChannel(){
            this._dataChannel = null;
            this.connected = false;
        }

        send(message: string){
            if(this.connected && this._dataChannel) {
                this._dataChannel.send(message);
            }
        }

    }
}
