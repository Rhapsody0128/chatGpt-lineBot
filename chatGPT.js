import { ChatGPTAPI } from 'chatgpt'

import linebot from 'linebot'


const apiKey = ""
const channelId = ""
const channelSecret = ""
const channelAccessToken = ""


const ChatGPT = new ChatGPTAPI({
  apiKey: apiKey,
  completionParams: {
    temperature: 1,
    top_p: 1
    // user:
  }
})


const bot = linebot({
  channelId: channelId,
  channelSecret: channelSecret,
  channelAccessToken: channelAccessToken
})

bot.listen('/', "9653", () => {
  // 在port啟動
  console.log('http://localhost:9653')
  console.log('機器人已啟動')

})

let lastRes = {
  
}
let allResponseMode = false

let characters = [
  {
    name:"間黑男",
    nickName:"怪醫黑傑克",
    description:"職業是密醫，口頭禪是'皮諾可這個直接電死'，性格冷漠。",
    photo:["https://upload.wikimedia.org/wikipedia/zh/4/42/Black_Jack_-_special.png",]
  }
]

function getImageUrl(str) {
  var regex = /http.*.(png|jpg|jpeg)/;
  var matches = str.match(regex);
  if (matches) {
    return matches[0];
  } else {
    return null;
  }
}

bot.on('message', async (event) => {
  try {
    let firstChar = event.message.text.charAt(0);
    let wakeUpkeyList = ["@","＠","!","！","#","＃"]
    let findkey = wakeUpkeyList.includes(firstChar)
    let judgeCanResponse = allResponseMode || findkey
    if(judgeCanResponse){
      let content = event.message.text
      if(!allResponseMode){
        content = content.substring(1);
      }
      let user = event.source.userId
      let group = event.source.groupId
      let key = group || user
      if(lastRes[key] == undefined){
        lastRes[key] = {}
      }

      let profile = await event.source.profile()
      profile = {
        name:profile.displayName,
        photo:profile.pictureUrl
      }
      let character = characters[0]
      const res = await ChatGPT.sendMessage(content,{
        promptPrefix:`ChatGPT是${JSON.stringify(character)}，User是${JSON.stringify(profile)}正在和你進行對話。`,
        // promptSuffix:``,
        conversationId: lastRes[key].conversationId || "",
        parentMessageId: lastRes[key].id || ""
      })
      console.log({profile,event,res,content})
      lastRes[key] = res
      
      let imgUrl = getImageUrl(res.text)
      console.log(imgUrl);

      let replyList = [{type:"text",text:res.text},]
      
      if(imgUrl){
        replyList.push({
          type: 'image',
          originalContentUrl: imgUrl,
          previewImageUrl: imgUrl
        })
      }
      event.reply(replyList)
      
    }
  } catch (error) {
    console.log(error);
    event.reply(error)
  }  
})
