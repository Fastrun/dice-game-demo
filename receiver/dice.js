Aui.ready(function () {
    var oDoc = Aui(document),
        docWidth = oDoc.width();

    Aui("body").html("<div id=\"container\" style=\"left:" + ( ( docWidth - 240 ) * 0.5 ) + "px;\"></div><strong id=\"shadow\" style=\"left:" + ( ( docWidth - 600 ) * 0.5 ) + "px;\"></strong>");

    var oContainer = Aui.byID("#container")[0],
        AuiCon = Aui(oContainer),
        AuiShadow = Aui("#shadow"),

        transform = function (elem, value, key) {
            key = key || "transform";

            [ "-webkit-", "-moz-", "-ms-", "-o-", "" ].forEach(function (pre) {
                elem.style[ pre + key ] = value;
            });
            return elem;
        },
        piece = function (value, key) {
            var str = "";
            key = key || "transform";
            [ "-webkit-", "-moz-", "-ms-", "-o-", "" ].forEach(function (pre) {
                str += ( pre + key + ":" + value );
                return false;
            });
            return str;
        },
        startMove = function startMove(obj) {
            obj.timer = obj.timer || null;
            clearInterval(obj.timer);
            obj.timer = setInterval(function () {
                x -= speedY;
                y += speedX;
                speedY *= 0.95;
                speedX *= 0.95;
                if (Math.abs(speedX) < 0.1 && Math.abs(speedY) < 0.1) {
                    stopMove(obj.timer);
                }
                ;
                transform(obj, "perspective(" + pers + "px) rotateX(" + x + "deg) rotateY(" + y + "deg)");

            }, 100);
        },
        stopMove = function (t) {
            clearInterval(t);
        },

        setNum = function (obj, n) {
            var arr = [
                [ 4 ],
                [ 0, 8 ],
                [ 0, 4, 8 ],
                [ 0, 2, 6, 8 ],
                [ 0, 2, 4, 6, 8 ],
                [ 0, 2, 3, 5, 6, 8]
            ];
            Aui.each(arr[n], function (i, v) {
                obj.find("li")
                    .eq(v)
                    .html("<span></span>");
            });
        };
    x = -10,
        y = 45,
        speedX = 0,
        speedY = 0,
        i = 1,
        d_x = 0,
        d_y = 0,
        d_z = 519,
        pers = 2000,
        _top = 400;
    while (i < 7) {
        if (i < 5) {
            d_x = 0;
            d_y = i * 90;
        }
        else if (i === 5) {
            d_x = 90;
            d_y = 0;
        }
        else {
            d_x = -90;
            d_y = 0;
        }
        ;
        AuiCon.append("<div id=\"box-" + i + "\" style=\"" + piece("rotateX(" + d_x + "deg) rotateY(" + d_y + "deg) translateZ(" + d_z + "px) scaleX( 0.4 ) scaleY( 0.4 );") + "opacity:0;\"><div><ul><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul></div></div>");

        i += 1;
    }
    ;
    var oDiv = AuiCon.children("div");
    Aui.each(oDiv, function (i) {
        (function (d, obj) {
            setTimeout(function () {
                obj.style.opacity = 1;

                setTimeout(function () {
                    setNum(Aui(obj), d);

                    if (d < 4) {
                        transform(obj, "rotateX(0deg) rotateY(" + ( i * 90 ) + "deg) translateZ(180px) scaleX( 1 ) scaleY( 1 )");
                    }
                    else if (d === 5) {
                        transform(obj, "rotateX(90deg) rotateY(0deg) translateZ(180px) scaleX( 1 ) scaleY( 1 )");

                        setTimeout(function () {
                            AuiShadow.fx({ opacity: 1 }, 400);

                            Aui.each(oDiv, function (x) {
                                if (x < 4) {
                                    transform(this, "rotateX(0deg) rotateY(" + ( x * 90 ) + "deg) translateZ(72px) scaleX( 0.6 ) scaleY( 0.6 )");
                                }
                                else if (x === 5) {
                                    transform(this, "rotateX(90deg) rotateY(0deg) translateZ(72px) scaleX( 0.6 ) scaleY( 0.6 )");
                                }
                                else if (x === 4) {
                                    transform(this, "rotateX(-90deg) rotateY(0deg) translateZ(72px) scaleX( 0.6 ) scaleY( 0.6 )");
                                }
                                ;
                            });
                        }, 400);
                    }
                    else if (d === 4) {
                        transform(obj, "rotateX(-90deg) rotateY(0deg) translateZ(180px) scaleX( 1 ) scaleY( 1 )");
                    }
                    ;
                }, 100);
            }, d * 200);
        })(i, this);
    });

    /*********** fling app *************/
    var init_fling = function () {
        var self = this;
        this.receiverDaemon = new ReceiverDaemon("~dice");
        var channel = this.receiverDaemon.createMessageChannel("ws");
        this.receiverDaemon.open();

        channel.on("message", function(senderId, messageType, message) {
            console.info("channel message ", senderId, messageType, message);
            switch (messageType) {
                case "senderConnected":
                case "senderDisconnected":
                    break;
                case "message":
                    var messageData = JSON.parse(message.data);
                    var namespace = messageData.namespace;
                    console.info("namespace:", namespace);
                    if (namespace == "urn:x-cast:com.infthink.fling.dice") {
                        var data = JSON.parse(messageData.data);
                        console.log('********onMessage********' + JSON.stringify(data));
                        if (data.command === 'start') {
                            console.log(' message command: ' + data.command);
                            self.speedY = speedY + Math.random()* 10 + 100;
                            self.speedX = speedX + Math.random()* 10 + 100;
                            startMove(oContainer);
                        } else if (data.command === 'stop') {
                            console.log(' message command: ' + data.command);
                        } else {
                            console.log('Invalid message command: ' + data.command);

                        }
                    } else {
                        console.info("3 namespace:", namespace);
                    }
                    break;
            }
        });
    };

    init_fling();
});