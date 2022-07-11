import axios from "axios";
import fetch from "node-fetch";
import formData from "form-data";
import * as fileType from "file-type";
import cheerio from "cheerio";
import vm from "node:vm";
import fs from "node:fs";
import JsO from "javascript-obfuscator";
import acrcloud from "acrcloud";
import gTTS from "gtts"
let token_coc = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjVhNDk3NmQ3LWRhNmItNGZhZS04YTNmLTU3ZDEyMGY0ZjdjMiIsImlhdCI6MTY0OTEyNDMxNiwic3ViIjoiZGV2ZWxvcGVyL2YwMWE2NzY1LTA5MTItNDQxYy0wMjdjLTM2YmFkZmUzNTExOSIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjIwLjIyOC4yMzUuMTkwIl0sInR5cGUiOiJjbGllbnQifV19.csAe9-pqpNNo-B-pAvHSI-OqrdzZ0VLSXOFmu4gi2ixwyxdMsXYtZ-oElx6SNEAC7BMrXI-IiofXxpcCIOKaoA";
let acropts = {
    host: "identify-eu-west-1.acrcloud.com",
    access_key: "cc0155322ccff43d32eb56e9ffe873da",
    access_secret: "CWny9hlFzguEZZ1EeYwt9H411SGqiZ5fPeUB69BK"
};

export const getCookie = async (...args) => (await axios(...args)).headers["set-cookie"];

export function anonfiles() {
    this.upload = anonUpload
    this.download = anonDownload
}
async function anonUpload(buff) {
    let form = new formData()
    let {
        ext
    } = await fileType.fileTypeFromBuffer(buff)
    form.append("file", buff, "xontol." + ext)
    try {
        let xontol = await axios({
            url: "https://api.anonfiles.com/upload",
            method: "post",
            data: form,
            headers: form.getHeaders()
        })
        return xontol.data.data.file
    } catch (e) {
        return e.response
    }
}
export async function yt(url, type = "audio") {

    return (await require("@bochilteam/scraper").youtubedlv2(url))[type][type == "audio" ? "128kbps" : "1080p"].download()

}
async function anonDownload(url) {
    let $ = cheerio.load(await (await axios(url)).data)
    let res = $("#download-url").attr("href")
    return (await fetch(res)).buffer()
}
export function randomBytes(size) {
  return require("crypto").randomBytes(size).toString("hex").substr(0, size)
}

export function parseSeconds(sec) {
  let h = Math.floor(sec / 3600)
  let m = Math.floor(sec / 60) % 60
  let s = Math.floor(sec) % 60
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":")
}

export async function ytdl(url) {
  if(!url) return false
  let { data } = await axios(`https://s4.youtube4kdownloader.com/ajax/getLinks.php?video=${encodeURIComponent(url)}&rand=${randomBytes(13)}`)
  if(data.status != "success") throw data
  let result = {
    thumbnail: data.data.thumbnail,
    duration: parseSeconds(data.data.duration),
    title: data.data.title,
    video: [],
    audio: []
  }
  for(let i in data.data.av) {
    result.video.push({
      size: data.data.av[i].size ? data.data.av[i].size : "unknown",
      ext: data.data.av[i].ext || "unknown",
      url: data.data.av[i].url || "unknown",
      quality: data.data.av[i].quality || "unknown",
      fps: data.data.av[i].fps || "unknown",
    })
  }
  for(let i in data.data.a) {
    result.audio.push({
      size: data.data.a[i].size ? data.data.a[i].size : "unknown",
      ext: data.data.a[i].ext || "unknown",
      url: data.data.a[i].url || "unknown",
      quality: data.data.a[i].quality ? data.data.a[i].quality.replace("<br><small>", "\n").replace("</small>", "") : "unknown",
      fps: data.data.a[i].fps || "unknown",
    })
  }
  return result
}

export async function igstalk(username) {
  if(!username) return { error: true, message: "Username?" }
  let tch = await fetch(`https://greatfon.com/v/${username}`)
  let data = await tch.text()
  let $ = cheerio.load(data)

  let result = {}
  let profile = $("div.user__img").attr("style").split("\'")[1]
  let name = $("h1.user__title").text()
  let infos1 = $("ul.user__list").html().split("<li class=\"user__item\">").map(v => v.split("</li>")[0]).filter(v => !!v)
  let posts = infos1[0].replace("Posts", "").trim().replace(/ /gi, ".")
  let followers = infos1[1].replace("Followers", "").trim().replace(/ /gi, ".")
  let following = infos1[2].replace("Following", "").trim().replace(/ /gi, ".")
  let bio = $("div.user__info-desc").html().replace(/(\&amp\;)/gi, "&").replace(/(<([^>]+)?br([^>]+)?>)/gi, "\n").replace(/(<([^>]+)>)/gi, "").trim()

  return {
      username,
      profile,
      name,
      posts,
      followers,
      following,
      bio
    }
  }
async function savefrom() {
    let body = new URLSearchParams({
        "sf_url": encodeURI(arguments[0]),
        "sf_submit": "",
        "new": 2,
        "lang": "id",
        "app": "",
        "country": "id",
        "os": "Windows",
        "browser": "Chrome",
        "channel": " main",
        "sf-nomad": 1
    });
    let {
        data
    } = await axios({
        "url": "https://worker.sf-tools.com/savefrom.php",
        "method": "POST",
        "data": body,
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "origin": "https://id.savefrom.net",
            "referer": "https://id.savefrom.net/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"
        }
    });
    let exec = '[]["filter"]["constructor"](b).call(a);';
    data = data.replace(exec, `\ntry {\ni++;\nif (i === 2) scriptResult = ${exec.split(".call")[0]}.toString();\nelse (\n${exec.replace(/;/, "")}\n);\n} catch {}`);
    let context = {
        "scriptResult": "",
        "i": 0
    };
    vm.createContext(context);
    new vm.Script(data).runInContext(context);
    return JSON.parse(context.scriptResult.split("window.parent.sf.videoResult.show(")?.[1].split(");")?.[0])
}

async function aiovideodl(url) {
    let {
        data,
        headers
    } = await axios("https://aiovideodl.ml/");
    let $ = cheerio.load(data);
    let token = $("#token").attr("value");
    let cookie = headers["set-cookie"].join("; ");
    let body = new URLSearchParams({
        url,
        token
    });
    let {
        data: res
    } = await axios({
        "url": "https://aiovideodl.ml/wp-json/aio-dl/video-data/",
        "method": "POST",
        "data": body,
        "headers": {
            "content-type": "application/x-www-form-urlencoded",
            "cookie": cookie,
            "origin": "https://aiovideodl.ml",
            "referer": "https://aiovideodl.ml/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36"
        }
    });
    return res;
}

async function dl() {
    let url = arguments[0];
    if (!url) throw new Error("url lu kosong kontol");
    let res;
    try {
        res = {
            "status": 200,
            "server": "aiovideodl",
            "result": await aiovideodl(url)
        };
    } catch (e) {
        res = {
            "status": 200,
            "server": "savefrom",
            "result": await savefrom(url)
        };
    } finally {
        if (res) return res;
    }
}

function DeepApi() {
    let list = ["0d182ada-c4fb-459b-ab3a-b9193b300564", "990cd8d3-5d3c-4b66-a30f-7fbb73c71049"]
    return list[Math.floor(Math.random() * list.length)]
}
async function deepai(type, files = {}) {
    if (!type) return new Error("no type")
    let form = new formData;
    for (let key of Object.keys(files)) form.append(key, files[key], Buffer.isBuffer(files[key]) ? "kontol.png" : null);
    try {
        let res = await axios.post("https://api.deepai.org/api/" + type, form, {
            headers: {
                "api-key": DeepApi(),
                ...form.getHeaders()
            }
        });
        return res.data
    } catch (e) {
        return new Error(e.response.data.err)
    };
};

function ClashOfClans(token) {
    if (!token) throw new Error("no token");
    this.token = token;
    this.baseURL = "https://api.clashofclans.com";
    this.version = 1;
    this._request = {};
    this.fetchRequest();
}

ClashOfClans.prototype.fetchRequest = function() {
    this._request = axios.create({
        "baseURL": `${this.baseURL}/v${this.version}`,
        "headers": {
            "Authorization": "Bearer " + this.token
        }
    });
};

ClashOfClans.prototype.getPlayers = function() {
    let id = arguments[0];
    if (!id) throw new Error("no id");
    return new Promise(async (res, rej) => {
        this._request(`/players/${encodeURIComponent(id)}`).then(function(data) {
            res({
                "status": 200,
                "result": data.data
            });
        }).catch((err) => {
            rej(err.response.data);
        });
    });
};

ClashOfClans.prototype.languages = function() {
    return new Promise(async (res, rej) => {
        this._request("/languages").then(function(data) {
            res({
                "status": 200,
                "result": data.data
            });
        }).catch((err) => {
            rej(err.response.data);
        });
    });
};

function idML(userId, zoneId) {
    if (!userId) return new Error("no userId")
    if (!zoneId) return new Error("no zoneId")
    return new Promise((resolve, reject) => {
        let body = {
            "voucherPricePoint.id": 4150,
            "voucherPricePoint.price": "1565.0",
            "voucherPricePoint.variablePrice": 0,
            "n": "",
            "email": "",
            "userVariablePrice": 0,
            "order.data.profile": "",
            "user.userId": userId,
            "user.zoneId": zoneId,
            "msisdn": "",
            "voucherTypeName": "MOBILE_LEGENDS",
            "shopLang": "id_ID",
            "impactClickId": "",
            "affiliateTrackingId": "",
            "checkoutId": "",
            "tmwAccessToken": "",
            "anonymousId": ""
        };
        axios({
            "url": "https://order-sg.codashop.com/initPayment.action",
            "method": "POST",
            "data": body,
            "headers": {
                "Content-Type": "application/json; charset/utf-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
            }
        }).then(({
            data
        }) => {
            resolve({
                "username": data.confirmationFields.username,
                "country": data.confirmationFields.country,
                "userId": userId,
                "zoneId": zoneId
            });
        }).catch(reject);
    });
}

function idFF(userId) {
    if (!userId) return new Error("no userId");
    return new Promise((resolve, reject) => {
        let body = {
            "voucherPricePoint.id": 8050,
            "voucherPricePoint.price": "",
            "voucherPricePoint.variablePrice": "",
            "n": "",
            "email": "",
            "userVariablePrice": "",
            "order.data.profile": "",
            "user.userId": userId,
            "voucherTypeName": "FREEFIRE",
            "affiliateTrackingId": "",
            "impactClickId": "",
            "checkoutId": "",
            "tmwAccessToken": "",
            "shopLang": "in_ID"
        };
        axios({
            "url": "https://order.codashop.com/id/initPayment.action",
            "method": "POST",
            "data": body,
            "headers": {
                "Content-Type": "application/json; charset/utf-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
            }
        }).then(({
            data
        }) => {
            resolve({
                "username": data.confirmationFields.roles[0].role,
                "userId": userId,
                "country": data.confirmationFields.country
            });
        }).catch(reject);
    });
}

function idCOC(userId) {
    if (!userId) return new Error("no userId");
    return new Promise((resolve, reject) => {
        let coc = new ClashOfClans(token_coc);
        coc.getPlayers(userId).then((usr) => {
            resolve({
                "username": usr.result.name,
                "userId": userId
            });
        }).catch(reject);
    });
}


var baseURL = "https://duniagames.co.id";
const topup = async (userId, zoneId, diamond, phone, game) => {
    if (!userId || !diamond || !phone || !game) return new Error();
    let cookie = await getCookie(baseURL);
    if (!cookie) return new Error("empty cookies");
    let res = await axios.post(`https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store?${getVal(diamond, game.toUpperCase())}&gameId=${userId}&product_ref=REG&product_ref_denom=AE`, null, {
        "headers": {
            "cookie": cookie.join(" "),
            "origin": baseURL,
            "referer": baseURL
        }
    });
    if (res.status != 200) throw new Error(res.statusText);
    let res2 = await axios.post(`https://api.duniagames.co.id/api/transaction/v1/top-up/transaction/store?inquiryId=${res.data.data.inquiryId}&phoneNumber=${phone}&transactionId=${res.data.data.transactionId}`, null, {
        "headers": {
            "cookie": cookie.join(" "),
            "origin": baseURL,
            "referer": baseURL
        }
    });
    if (res2.status != 200) throw new Error(res2.statusText);
    return res2.data;
};

function getVal(dm, game) {
    let list = JSON.parse(fs.readFileSync("./duniagames.json"));
    if (!list[game]) return new Error("no game for '" + game + "'");
    return new URLSearchParams(list[game][dm]).toString();
}

function JSObfuscator(code) {
    if (!code) return code;
    let o = JsO.obfuscate(code);
    return o.getObfuscatedCode();
}

async function identifymusic(media, opts) {
    if (!media) return new Error("No media");
    if (opts && !opts.access_key && !opts.access_secret) return new Error("missing options");
    let acr = new acrcloud(opts || acropts);
    let res = await acr.identify(media)
    if (!("metadata" in res)) return new Error(res.status.msg)
    return res.metadata.music[0];
}
async function top4top(bapper) {
    let ftyp = await (await fileType.fileTypeFromBuffer(bapper)).ext
    let form = new formData
    let kontol = () => Math.floor(Math.random() * 10000) + "." + ftyp
    if (Array.isArray(bapper)) {
        for (let i = 0; i < 7; i++) form.append(`file_${i + 1}_`, bapper[i], kontol())
    }
    form.append("file_1_", bapper, kontol())
    form.append("submitr", "[ رفع الملفات ]")
    let res = await axios({
        url: "https://top4top.io/index.php",
        method: "POST",
        data: form,
        headers: {
            ...form.getHeaders()
        }
    })
    let $ = cheerio.load(res.data)
    let result = []
    $("div[class=inputbody]").each(function() {
        let url = $(this).find(".all_boxes").val()
        if (!url.startsWith("[")) return result.push(url)
    })
    if (result[0] === undefined) return "Error: ```unsuported file type!!``` \n*file support jpg/mp3/mp4*"
    if (result) return {
        url: result[0],
        delete_url: result[1]
    }
}
import hr from "human-readable";

export let formatSize = hr.sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`
})
export async function jarak(dari, ke) {

    if (!dari) return "Dari?"

    if (!ke) return "Ke?"

    let url = `https://www.google.com/search?q=${encodeURIComponent("jarak " + dari + " ke " + ke)}&hl=id`

    let {
        data
    } = await axios(url)

    let $ = cheerio.load(data)

    let img = data.split("var s=\'")[1].split("\'")[0]

    return {

        img: await (await top4top(/^data:.*?\/.*?;base64,/i.test(img) ? Buffer.from(img.split`,` [1], 'base64') : '')).url,

        desc: $("div.BNeawe.deIvCb.AP7Wnd").text()

    }

}

export async function gdrive(url) {
    let id
    if (!(url && url.match(/drive\.google/i))) throw 'Invalid URL'
    id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1]
    if (!id) throw 'ID Not Found'
    let res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
        method: 'post',
        headers: {
            'accept-encoding': 'gzip, deflate, br',
            'content-length': 0,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'origin': 'https://drive.google.com',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36',
            'x-client-data': 'CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=',
            'x-drive-first-party': 'DriveWebUi',
            'x-json-requested': 'true'
        }
    })
    let {
        fileName,
        sizeBytes,
        downloadUrl
    } = JSON.parse((await res.text()).slice(4))
    if (!downloadUrl) throw 'Link Download Limit!'
    let data = await fetch(downloadUrl)
    if (data.status !== 200) throw data.statusText
    return {
        downloadUrl,
        fileName,
        fileSize: formatSize(sizeBytes),
        mimetype: data.headers.get('content-type')
    }
}
export async function mix(emoji1, emoji2) {
    if (!emoji1 || !emoji2) return "Emty Emoji"
    let data = await (await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=g_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`)).json()
    if (data) return data
    else return !1
}
export async function gtts(teks, lang) {
    var ran = "./cache/" + getRandom("mp3")
    var _gtts = new gTTS(teks, lang);
    _gtts.save(ran, function() {
        return ran
    })
}

export default () => "Haii...";
export {
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
    deepai
}