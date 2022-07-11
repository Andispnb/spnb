import {
    S_WHATSAPP_NET,
    downloadContentFromMessage
} from "@adiwajshing/baileys";
import moment from "moment-timezone";
import chalk from "chalk";
import cp, {
    execSync
} from "child_process";
import fs from "fs";
import {
    Sticker
} from "wa-sticker-formatter"
import webpmux from "node-webpmux"

export default Message;
export let owner = ["628812904283@s.whatsapp.net", "6281228108657@s.whatsapp.net"] //,"62882008702120@s.whatsapp.net"];
export let map = new Map();
export let set = new Set();
let anonymous = {}
let sock = {};
let store = {};

function Message(msg, client, conn) {
    sock = client;
    store = conn;
    if (!msg?.message) return;
    let type = Object.keys(msg.message)[0];
    this.key = msg.key;
    this.from = this.key.remoteJid;
    this.fromMe = this.key.fromMe;
    this.id = this.key.id;
    this.isGroup = this.from.endsWith("@g.us");
    this.me = sock.type == "md" ? sock.user.id.split(":")[0] + S_WHATSAPP_NET : sock.state.legacy.user.id;
    this.sender = this.fromMe ? this.me : this.isGroup ? msg.key.participant : this.from;
    if (type == "conversation" || type == "extendedTextMessage") this.text = msg.message?.conversation || msg.message?.extendedTextMessage;
    this.type = type;
    this.isOwner = !!owner.find(v => v == this.sender);
    this.isBaileys = this.id.startsWith("BAE5") && this.id.length == 16;
    this.fakeObj = msg;
    if (this.fakeObj.message[type]?.contextInfo?.quotedMessage) this.quoted = new QuotedMessage(this, sock, store);
    this.pushname = msg.pushName;
    this.messageTimestamp = msg.messageTimestamp;
}

Message.prototype.toJSON = function() {
    let str = JSON.stringify({
        ...this
    });
    return JSON.parse(str);
};

Message.prototype.download = function() {
    return (async ({
        fakeObj,
        type
    }) => {
        if (type == "conversation" || type == "extendedTextMessage") return undefined;
        let stream = await downloadContentFromMessage(fakeObj.message[type], type.split("M")[0]);
        return await streamToBuff(stream);
    })(this);
};

function QuotedMessage(msg, sock, store) {
    let contextInfo = msg.fakeObj.message[msg.type].contextInfo;
    let type = Object.keys(contextInfo.quotedMessage)[0];
    this.key = {
        remoteJid: msg.from,
        fromMe: contextInfo.participant == msg.me,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant
    };
    this.id = this.key.id;
    this.sender = this.key.participant;
    this.fromMe = this.key.fromMe;
    this.mentionedJid = contextInfo.mentionedJid;
    if (type == "conversation" || type == "extendedTextMessage") this.text = contextInfo.quotedMessage?.conversation || contextInfo.quotedMessage?.extendedTextMessage;
    this.type = type;
    this.isOwner = !!owner.find(v => v == this.sender);
    this.isBaileys = this.id.startsWith("BAE5") && this.id.length == 16;
    this.fakeObj = contextInfo.quotedMessage;
}

QuotedMessage.prototype.toJSON = function() {
    let str = JSON.stringify({
        ...this
    });
    return JSON.parse(str);
};

QuotedMessage.prototype.download = function() {
    return (async ({
        fakeObj,
        type
    }) => {
        if (type == "conversation" || type == "extendedTextMessage") return undefined;
        let stream = await downloadContentFromMessage(fakeObj[type], type.split("M")[0]);
        return await streamToBuff(stream);
    })(this);
};

QuotedMessage.prototype.delete = function() {
    return sock.sendMessage(this.key.remoteJid, {
        delete: {
            remoteJid: this.key.remoteJid,
            id: this.id
        }
    });
};

QuotedMessage.prototype.getQuotedObj = function() {
    return (async ({
        key,
        id
    }, sock, store) => {
        let res = await store.loadMessage(key.remoteJid, id);
        return new Message(res, sock, store);
    })(this, sock, store);
};

export function color(t, c) {
    return chalk[c](t)
}

export function getRandom(ext) {
    ext = ext || ""
    return `${Math.floor(Math.random() * 100000)}.${ext}`
}

export async function streamToBuff(stream) {
    let buff = Buffer.alloc(0)
    for await (const chunk of stream) buff = Buffer.concat([buff, chunk])
    return buff
}

export function ffmpegDefault(path, out) {
    let ff = cp.execSync(`ffmpeg -i ${path} ${out}`)
    if (ff.length == 0) return out
}
export function hapus(path) {
    return fs.unlinkSync(path)
}
export function simpan(path, buff) {
    return fs.writeFileSync(path, buff)
}
export function clearCache(req) {
 cp.execSync(`rm *${req}`)
}
export async function sticker(metadata, options) {
    if (!metadata) throw CustomError("Data must be of type string or an instanceof buffer", "StickerError")
    let stc = new Sticker(metadata, options)
    await stc.build()
    return await stc.get()
}
export async function getExif(data) {
    let s = new webpmux.Image()
    await s.load(data)
    return JSON.parse(s.exif.slice(22).toString())
}
export function CustomError(msg, name = "Error") {
    let err = new TypeError;
    err.name = name
    err.message = msg
    return err
}
let zodiak = [
    ["Capricorn", new Date(1970, 0, 1)],
    ["Aquarius", new Date(1970, 0, 20)],
    ["Pisces", new Date(1970, 1, 19)],
    ["Aries", new Date(1970, 2, 21)],
    ["Taurus", new Date(1970, 3, 21)],
    ["Gemini", new Date(1970, 4, 21)],
    ["Cancer", new Date(1970, 5, 22)],
    ["Leo", new Date(1970, 6, 23)],
    ["Virgo", new Date(1970, 7, 23)],
    ["Libra", new Date(1970, 8, 23)],
    ["Scorpio", new Date(1970, 9, 23)],
    ["Sagittarius", new Date(1970, 10, 22)],
    ["Capricorn", new Date(1970, 11, 22)]
].reverse()

function getZodiac(month, day) {
    let d = new Date(1970, month - 1, day)
    return zodiak.find(([_,_d]) => d >= _d)[0]
}
export function cekUsia(ttl) {
let date = new Date(ttl)
    if (date == 'Invalid Date') throw date
    let d = new Date()
    let [tahun, bulan, tanggal] = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    let birth = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    let zodiac = getZodiac(birth[1], birth[2])
    let ageD = new Date(d - date)
    let age = ageD.getFullYear() - new Date(1970, 0, 1).getFullYear()
    let birthday = [tahun + (+ new Date(1970, bulan - 1, tanggal) > + new Date(1970, birth[1] - 1, birth[2])), ...birth.slice(1)]
    let cekusia = bulan === birth[1] && tanggal === birth[2] ? `Selamat ulang tahun yang ke-${age} 🥳` : age
    let teks = `
Lahir : ${birth.join('-')}
Umur : ${cekusia}
Zodiak : ${zodiac}
Ultah Mendatang : ${birthday.join('-')}
`.trim()
return teks
}
function Audio() {
    this.ingfo = "Halo....";
}

Audio.prototype.bass = function(path, length, out) {
    return this.exec(path, `-af equalizer=f=${length}:width_type=o:width=2:g=20`, out)
}

Audio.prototype.volume = function(path, length, out) {
    return this.exec(path, `-filter:a "volume=${length}"`, out)
}

Audio.prototype.imut = function(path) {
    return this.exec(path, `-af atempo=1/2,asetrate=44500*2/1`, arguments[2])
}

Audio.prototype.vibra = function(path, length, out) {
    return this.exec(path, `-filter_complex "vibrato=f=${length}"`, out)
}

Audio.prototype.cut = function(path, ar, out) {
    path = this.toPath(path)
    let outname = this.randomFilename()
    let ff = execSync(`ffmpeg -ss ${ar[0]} -i ${path} -t ${ar[1]} -c copy ${outname}`).toString()
    if (ff.length == 0) return fs.readFileSync(outname)
}

Audio.prototype.robot = function(path) {
    return this.exec(path, `-filter_complex "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75"`, arguments[2])
}

Audio.prototype.hode = function(path) {
    return this.exec(path, `-af atempo=4/3,asetrate=44500*3/4`, arguments[2])
}

Audio.prototype.tempo = function(path, length, out) {
    return this.exec(path, `-filter:a "atempo=1.0,asetrate=${length}"`, out)
}

Audio.prototype.cool = function(path, delay = 500, out) {
    return this.exec(path, `-af "aecho=in_gain=0.5:out_gain=0.5:delays=${delay}:decays=0.2"`)
}

Audio.prototype.create = function() {
    return new Promise(async res => {
        let [key, val] = [Object.keys(arguments[1]), Object.values(arguments[1])];
        let path = this.toPath(arguments[0]);
        let i = 0;
        let hm = [];
        while (i < key.length && val.length) {
            if (i == 0) hm.push(await this[key[i]](path, val[i]))
            if (i == 1) hm.push(await this[key[i]](hm[i - 1], val[i]))
            if (i == 2) hm.push(await this[key[i]](hm[i - 1], val[i]))
            if (i == 3) hm.push(await this(key[i])(hm[i - 1], val[i]))
            if (i == 4) hm.push(await this(key[i])(hm[i - 1], val[i]))
            i++
        }
        res(hm[hm.length - 1]);
    });
}

Audio.prototype.exec = function(filename, command, out) {
    filename = this.toPath(filename)
    let outname = out || this.randomFilename()
    let ff = execSync(`ffmpeg -i ${filename} ${command} ${outname} -y`).toString()
    let file = fs.readFileSync(outname)
    fs.unlinkSync(outname)
    if (ff.length == 0) return file
}

Audio.prototype.randomFilename = function() {
    return Math.floor(Math.random() * 100 * 100) + ".mp3"
}

Audio.prototype.toPath = function() {
    let buff = arguments[0];
    if (!Buffer.isBuffer(buff)) {
        if (!fs.existsSync(buff)) throw this.makeError("no such file directory, open '" + filename + "'", "Error: ENOENT")
        return buff;
    }
    let file = this.randomFilename()
    fs.writeFileSync(file, buff)
    return file;
}

Audio.prototype.makeError = function(message, name) {
    let err = new Error;
    err.name = name;
    err.message = message;
    return err
}

export function random(value) {
    if (!value) return new Error("emty value")
    return value[Math.floor(Math.random() * value.length)]
}

function joinRoom(b) {
    let room = Object.values(anonymous).find(p => p.state == "WAITING" && !p.check(b))
    if (!room) return !1
    room.b = b
    room.state = "CHATTING"
    return room
}

function createRoom(a) {
    let room = Object.values(anonymous).find(p => p.check(a))
    if (!!room) return !1
    let id = Date.now()
    anonymous[id] = {
        id: id,
        a: a,
        b: "",
        state: "WAITING",
        check: function(p) {
            return [this.a, this.b].includes(p)
        },
        other: function(p) {
            return p == this.a ? this.b : p == this.b ? this.a : ""
        }
    }
    return Object.values(anonymous).find(p => p.check(a))
}

function leaveRoom(ab) {
    let room = Object.values(anonymous).find(p => p.check(ab))
    if (!room) return !1
    let other = room.other(ab)
    delete anonymous[room.id]
    return other
}

function chatsAdd(m) {
    set.add(m)
    setTimeout(() => {
        set.delete(m)
    }, 3000)
}

function chatsHas(m) {
    return !!set.has(m)
}

export const audio = new Audio;
export const anon = {
    joinRoom,
    createRoom,
    leaveRoom,
    anonymous
}
export const chatsFilter = {
    add: chatsAdd,
    has: chatsHas
}