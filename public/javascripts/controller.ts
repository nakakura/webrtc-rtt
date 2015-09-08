/// <reference path="typings/tsd.d.ts" />
/// <reference path="./models/peer_manager.ts" />

window.onload = function(){
    var peer = new RobotServer.PeerManager("oculus-video", {
        config: {"iceServers":[
            {"url": "stun:stun.skyway.io:3478"},
            {
                "url": 'turn:biztest-turn.skyway.io:443?transport=udp',
                'credential': 'wI+8tZRjUllYctlWD/sAvM9yutM=',
                'username': 'rinrin_1234'
            },
            {
                "url": 'turn:biztest-turn.skyway.io:443?transport=tcp',
                'credential': 'wI+8tZRjUllYctlWD/sAvM9yutM=',
                'username': 'rinrin_1234'
            }
        ]},
        port: 443,
        secure: true,
        key: '62ac6ff0-6863-455a-a214-83a1cb6c9a82',
        debug: 3});

    peer.addNeighbor(new RobotServer.Neighbor("oculus-video", RobotServer.NeighborTypeEnum.video));
    peer.addNeighbor(new RobotServer.Neighbor("oculus-data", RobotServer.NeighborTypeEnum.data));

    peer.addListener(peer.OnDataReceivedEvent, (data)=>{
        var json = JSON.parse(data);
        json.type = "oculus";
    });

};

