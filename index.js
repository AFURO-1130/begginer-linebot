"use strict";
// モジュール呼び出し
const crypto = require("crypto");
const line = require("@line/bot-sdk");

// インスタンス生成
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = (event, context, callback) => {
    // 署名検証
    const signature = crypto
        .createHmac("sha256", process.env.CHANNELSECRET)
        .update(event.body)
        .digest("base64");
    let checkHeader = (event.headers || {})["x-Line-Signature"];
    if (!checkHeader) {
        checkHeader = (event.headers || {})["x-line-signature"];
    }
    const body = JSON.parse(event.body);
    const events = body.events;
    console.log(events);

    // 署名検証が成功した場合
    if (signature === checkHeader) {
        events.forEach(async (event) => {
            let message;
            // イベントタイプごとに関数を分ける
            switch (event.type) {
                // メッセージイベント
                case "message":
                    message = await messageFunc(event);
                    break;
                // フォローイベント
                case "follow":
                    message = { type: "text", text: "追加ありがとうございます！" };
                    break;
                // ポストバックイベント
                case "postback":
                    message = await postbackFunc(event);
                    break;
            }
            // メッセージを返信
            if (message != undefined) {
                client
                    .replyMessage(body.events[0].replyToken, message)
                    .then((response) => {
                        const lambdaResponse = {
                            statusCode: 200,
                            headers: { "X-Line-Status": "OK" },
                            body: '{"result":"completed"}',
                        };
                        context.succeed(lambdaResponse);
                    })
                    .catch((err) => console.log(err));
            }
        });
    }
    // 署名検証に失敗した場合
    else {
        console.log("署名認証エラー");
    }
};
//問題のflexメッセージを入れるところ
const quiz = [
    {
        "type": "flex",
        "altText": "問題だよ",
        "contents":
        {
            "type": "bubble",
            "direction": "ltr",
            "action": {
                "type": "postback",
                "label": "あああ",

                "data": "あああ"
            },
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "Header",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "had betterに意味は？",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": "~する方が良い",
                            "data": "0"
                        },
                        "gravity": "top"
                    },
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": "〜した方がよい",

                            "data": "1"
                        }
                    }
                ]
            }
        }
    }
    , {
        "type": "flex",
        "altText": "問題だよーん",
        "contents": {
            "type": "bubble",
            "direction": "ltr",
            "action": {
                "type": "postback",
                "label": "あああ",
                "data": "あああ"
            },
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "Header",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "2021!の末尾に0は何個並ぶでしょう？",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": "55",
                            "data": "3"
                        },
                        "gravity": "top"
                    },
                    {
                        "type": "button",

                        "action": {
                            "type": "postback",
                            "label": "50",
                            "data": "2"
                        }
                    }
                ]
            }
        }
    }, {
        "type": "flex",
        "altText": "問題だよーん",
        "contents": {
            "type": "bubble",
            "direction": "ltr",
            "action": {
                "type": "postback",
                "label": "あああ",

                "data": "あああ"
            },
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "Header",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "教習おわるのはいつか？？",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "postback",
                            "label": "29日",

                            "data": "4"
                        },
                        "gravity": "top"
                    },
                    {
                        "type": "button",

                        "action": {
                            "type": "postback",
                            "label": "30日",

                            "data": "5"
                        }
                    }
                ]
            }
        }
    }];

const judge = [{
    type: "text", text: "正解だよ",
},
{
    type: "text", text: "もう一度考えよう！"
}];


let message;
let point = 0;
//テキストを送られたら返すメッセージ
//このメッセージを送ると点数リセット
const messageFunc = async function (event) {
    message = quiz[0];
    point = 0;
    return message;
};
//続きの問題
const postbackFunc = async function (event) {
    const result = {
        "type": "flex",
        "altText": "結果発表",
        "contents": {
            "type": "bubble",
            "direction": "ltr",
            "action": {
                "type": "postback",
                "label": "あああ",
                
                "data": "あああ"
            },
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "Header",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "結果発表",
                        "align": "center",
                        "contents": []
                    }
                ]
            },
            "footer": {
                "type": "box",
                "layout": "horizontal",
                "contents": [
                    {
                        "type": "text",
                        "text": "スコアは" + point + "点です",
                        "align": "center",
                        "contents": []
                    }
                ]
            }
        }
    };
    //正誤判定
    if (event.postback.data === "1"){
        ++point;
        point++;
        message = [judge[0], quiz[1]];
        return message;
    }
    else if (event.postback.data === "3"){
        point++;
        message = [judge[0], quiz[2]];

        return message;
    }
    else if (event.postback.data === "5"){
        point++;
        message = [judge[0], result];
        return message;
    }
    else {
        message = judge[1];
        point--;
        return message;
    }
};


