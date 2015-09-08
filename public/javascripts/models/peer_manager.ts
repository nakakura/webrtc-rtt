/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./neighbor.ts" />

module RobotServer{
    export class PeerManager extends EventEmitter2{
        protected _peer: PeerJs.Peer;
        private _neighbors: Array<Neighbor> = [];
        public OnDataReceivedEvent = "onDataReceived";
        public OnMediaReceivedEvent = "onMeidaReceived";

        constructor(private _peerID: string, private _config: any){
            super();
        }

        startConnection(){
            this._initializeState();
        }

        private _initializeState(){
            this._peer = new Peer(this._peerID, this._config);
            this._peer.on('open', ()=>{
                console.log("on open");
                console.log(this._peerID);
                this._openedState();
            });
        }

        private _openedState(){
            this._peer.on('disconnected', ()=>{
                this._timeoutState();
            });
            this._peer.on('error', (err)=>{ });
            this._peer.on('connection', this._onDataChannelOpend);
            this._peer.on('call', this._onMediaChannelOpend);
            this._tryConnect();
            this._tryCall();
        }

        private _tryConnect(){
            _(this._neighbors).filter((neighbor: Neighbor)=>{
                return neighbor.neighborType === NeighborTypeEnum.data && !neighbor.connected;
            }).each((neighbor: Neighbor)=>{
                var dataChannel = this._peer.connect(neighbor.peerID, {
                    label: 'json',
                    serialization: 'none',
                    reliable: false
                });
                neighbor.setDataChannel(dataChannel);
                neighbor.addListener(neighbor.OnDataReceivedEvent, (data)=>{
                    this.emit(this.OnDataReceivedEvent, data);
                });
            }).value();
        }

        private _onDataChannelOpend = (dataconnection: PeerJs.DataConnection)=>{
            var neighborID = dataconnection.peer;

            var neighbor: Neighbor = _.find(this._neighbors, (neighbor: Neighbor)=>{
                return neighbor.peerID === neighborID && neighbor.neighborType === NeighborTypeEnum.data;
            });

            if(!neighbor) neighbor = new Neighbor(neighborID, NeighborTypeEnum.data);
            neighbor.setDataChannel(dataconnection);
            neighbor.addListener(neighbor.OnDataReceivedEvent, (data)=>{
                this.emit(this.OnDataReceivedEvent, data);
            });
            this._neighbors.push(neighbor);
        };

        private _tryCall(){
            _(this._neighbors).filter((neighbor: Neighbor)=>{
                return neighbor.neighborType === NeighborTypeEnum.video && !neighbor.connected;
            }).each((neighbor: Neighbor)=>{
                var call = this._peer.call(neighbor.peerID, (<any>window).localStream);
                neighbor.setMediaConnetion(call);
            }).value();
        }

        private _onMediaChannelOpend = (mediaChannel: PeerJs.MediaConnection)=> {
            mediaChannel.answer((<any>window).localStream);
            var neighborID = mediaChannel.peer;

            var neighbor: Neighbor = _.find(this._neighbors, (neighbor: Neighbor)=>{
                return neighbor.peerID === neighborID && neighbor.neighborType === NeighborTypeEnum.video;
            });

            if(!neighbor) neighbor = new Neighbor(neighborID, NeighborTypeEnum.video);
            neighbor.setMediaConnetion(mediaChannel);
            neighbor.addListener(neighbor.OnMediaReceivedEvent, (stream)=>{
                this.emit(this.OnMediaReceivedEvent, stream);
            });
            this._neighbors.push(neighbor);
        };

        private _timeoutState(){
            try {
                this._peer.disconnect();
            } catch (e) {}
            this._peer = null;
            this._initializeState();
        }

        addNeighbor(neighbor: Neighbor){
            this._neighbors.push(neighbor);
        }

        send(message: string){
            _(this._neighbors).each((item: Neighbor)=>{
                item.send(message);
            }).value();
        }
    }
}

