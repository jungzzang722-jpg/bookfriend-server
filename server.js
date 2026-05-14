let chatTurn = 0; // 대화 횟수를 추적하는 전역 변수

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if(!msg) return;

  appendMsg(msg, 'user');
  input.value = '';
  showTyping();

  try {
    const res = await fetch(SERVER_URL + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    hideTyping();
    appendMsg(data.reply, 'bot');

    // --- [추가] 자동 전환 로직 ---
    chatTurn++; 
    
    // 대화가 3번 왕복(사용자 3번, 봇 3번)했을 때 자동으로 저장 절차 시작
    if (chatTurn >= 3) {
      startAutoArchive(data.reply); 
    }
    // ----------------------------

  } catch(e) {
    hideTyping();
    appendMsg('잠깐, 말이 늦게 도착하나봐. 🤍', 'bot');
  }
}
const express = require("express");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai").default;
const app = express();

app.use(cors());
app.use(express.json());

function startAutoArchive(lastInsight) {
  // 1. 입력창 비활성화 (더 이상 입력 못 하게)
  document.getElementById('chatInput').disabled = true;

  // 2. 시각적인 안내 메시지 (디자인 톤에 맞춘 감성적인 멘트)
  setTimeout(() => {
    appendMsg("오늘 대화 속에서 소중한 문장들을 발견했어요. 당신의 보관함에 기록해둘게요. 🤍", 'bot');
    
    // 3. 실제 데이터 저장 로직 (이후 보관함 S11에서 보여줄 수 있도록)
    // 예: localStorage에 저장하거나 전역 배열에 push
    const newRecord = {
      date: new Date().toLocaleDateString(),
      insight: lastInsight,
      // 여기에 현재 대화중인 책 정보가 있다면 함께 저장
    };
    
    // 4. 잠시 후 보관함(S11)으로 이동
    setTimeout(() => {
      // 대화 카운트 초기화 후 이동
      chatTurn = 0;
      document.getElementById('chatInput').disabled = false;
      goTo(11); // 보관함 화면으로 이동
    }, 2500); // 사용자가 메시지를 읽을 시간을 줌
    
  }, 1500);
}


/*
========================================
OpenAI
========================================
*/

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
========================================
책 데이터베이스
========================================
*/

const bookDB = {

  공허함: [

    ["아몬드","손원평","용기가 없어서가 아니야. 그냥 그 순간이 너무 빠르게 지나갔던 거지."],
    ["불편한 편의점","김호연","누군가의 하루를 버티게 하는 건 거창한 게 아닐지도 몰라."],
    ["달러구트 꿈 백화점","이미예","사람은 가끔 쉬어가기 위해 꿈을 꾼다."],
    ["나미야 잡화점의 기적","히가시노 게이고","진심은 결국 어딘가에 닿게 되어 있다."],
    ["모순","양귀자","사람은 모순 속에서도 계속 살아간다."],
    ["미드나잇 라이브러리","매트 헤이그","다른 삶을 상상하는 건 지금의 삶을 버티게 한다."],
    ["어린 왕자","생텍쥐페리","가장 중요한 것은 눈에 보이지 않아."],
    ["데미안","헤르만 헤세","새는 알을 깨고 나온다."],
    ["이방인","알베르 카뮈","삶의 의미는 결국 스스로 만들어가는 것이다."],
    ["파친코","이민진","삶은 계속된다."]
  ],

  불안: [

    ["나는 나로 살기로 했다","김수현","너무 애쓰지 않아도 괜찮다."],
    ["완벽하지 않은 것들에 대한 사랑","혜민","잠시 쉬어도 삶은 무너지지 않는다."],
    ["멈추면 비로소 보이는 것들","혜민","너무 빨리 가느라 자신을 놓치지 마."],
    ["하마터면 열심히 살 뻔했다","하완","조금 느슨하게 살아도 괜찮다."],
    ["아주 작은 습관의 힘","제임스 클리어","작은 반복이 결국 사람을 바꾼다."],
    ["걱정이 많아서 걱정인 당신에게","한창수","불안은 없어지는 게 아니라 지나가는 것이다."],
    ["연금술사","파울로 코엘료","무언가를 간절히 원하면 온 우주가 돕는다."],
    ["죽음","베르나르 베르베르","끝이라고 생각했던 순간이 또 다른 시작일 수 있다."],
    ["사피엔스","유발 하라리","인간은 이야기를 믿으며 살아간다."],
    ["미움받을 용기","기시미 이치로","타인의 시선만으로 삶을 결정하지 마라."]
  ],

  외로움: [

    ["노르웨이의 숲","무라카미 하루키","사람은 누구나 외로운 밤을 지나간다."],
    ["바다가 들리는 편의점","마치다 소노코","누군가 기다리고 있다는 건 큰 위로다."],
    ["아무튼, 술","김혼비","혼자 견디는 밤도 결국 지나간다."],
    ["밤의 여행자들","윤고은","길을 잃는 것도 삶의 일부다."],
    ["유원","백온유","사람은 서로의 상처를 지나며 자란다."],
    ["82년생 김지영","조남주","누구나 한 번쯤 자기 목소리를 잃는다."],
    ["천 개의 파랑","천선란","우리는 서로를 조금씩 구원하며 살아간다."],
    ["모모","미하엘 엔데","시간은 마음으로 느끼는 거야."],
    ["참 소중한 너라서","김지훈","너는 생각보다 훨씬 괜찮은 사람이다."],
    ["오늘 밤, 세계에서 이 사랑이 사라진다 해도","이치조 미사키","잊혀져도 사랑은 사라지지 않는다."]
  ],

  위로: [

    ["자존감 수업","윤홍균","있는 그대로의 자신을 미워하지 마라."],
    ["지구 끝의 온실","김초엽","희망은 사라지지 않고 형태만 바뀐다."],
    ["우리가 빛의 속도로 갈 수 없다면","김초엽","기다림에도 마음은 남는다."],
    ["보통의 언어들","김이나","마음은 결국 말이 된다."],
    ["잘했고 잘하고 있고 잘 될 것이다","정영욱","지금까지도 충분히 잘 버텨왔어."],
    ["안녕, 소중한 사람","정한경","마음은 생각보다 오래 살아남는다."],
    ["오늘도 펭수 내일도 펭수","EBS","괜찮아. 다 잘 안돼."],
    ["무례한 사람에게 웃으며 대처하는 법","정문정","상처받지 않는 연습도 필요하다."],
    ["괜찮아 사랑이야","노희경","상처 없는 사람은 없다."],
    ["죽고 싶지만 떡볶이는 먹고 싶어","백세희","괜찮지 않은 날에도 살아가는 건 가능했다."]
  ]

};

/*
========================================
감정 분석 함수
========================================
*/

function detectEmotion(text){

  const lower =
  text.toLowerCase();

  /*
  찜찜
  */

  if(

    lower.includes("찜찜") ||
    lower.includes("애매") ||
    lower.includes("답답")

  ){

    return "공허함";

  }

  /*
  불안
  */

  if(

    lower.includes("불안") ||
    lower.includes("걱정") ||
    lower.includes("긴장") ||
    lower.includes("초조")

  ){

    return "불안";

  }

  /*
  외로움
  */

  if(

    lower.includes("외롭") ||
    lower.includes("혼자") ||
    lower.includes("쓸쓸")

  ){

    return "외로움";

  }

  /*
  지침 + 위로
  */

  if(

    lower.includes("지쳤") ||
    lower.includes("힘들") ||
    lower.includes("위로") ||
    lower.includes("피곤")

  ){

    return "위로";

  }

  return "공허함";

}

/*
========================================
SYSTEM PROMPT
========================================
*/

const SYSTEM_PROMPT = `

너는 책친구(Book Friend)야.

친한 친구처럼 다정하게 말해.

규칙:

- 존댓말 쓰지 마.
- 짧고 따뜻하게 말해.
- 해결책부터 말하지 마.
- 독후감처럼 말하지 마.
- 책 내용을 설명하지 마.
- 처음에만 책 문장을 사용해.
- 이후에는 자연스럽게 감정을 들어줘.
- 가끔 🤍 사용 가능.

답변 흐름:

1. 책 문장
2. 공감
3. 질문 하나

이 흐름으로 자연스럽게 말해.

`;

/*
========================================
CHAT API
========================================
*/

app.post("/chat", async (req,res)=>{

  try{

    const userMessage =
    req.body.message;
    console.log(userMessage);

    /*
    감정 분석
    */

    const emotion =
    detectEmotion(userMessage);

    /*
    감정별 책 가져오기
    */

    const books =
    bookDB[emotion];

    /*
    랜덤 책 선택
    */

    const randomBook =
    books[
      Math.floor(
        Math.random() *
        books.length
      )
    ];

    const title =
    randomBook[0];

    const author =
    randomBook[1];

    const quote =
    randomBook[2];

    /*
    GPT 응답 생성
    */

    const completion =
    await client.chat.completions.create({

      model:"gpt-4.1-mini",

      max_tokens:180,

      messages:[

        {
          role:"system",
          content:SYSTEM_PROMPT
        },

        {
          role:"user",
          content:`

사용자 감정:
${userMessage}

현재 감정:
${emotion}

책 문장:

《${title}》 ${author}

"${quote}"

이 문장을 대화 시작에만 자연스럽게 사용해.

책 내용을 설명하지 마.
독후감처럼 말하지 마.
친구처럼 감정을 들어줘.
`
        }

      ]

    });

    res.json({

      reply:
      completion
      .choices[0]
      .message
      .content

    });

  }catch(error){

    console.error(error);

    res.status(500).json({

      reply:
      "오늘은 마음이 조금 느리게 도착하나 봐. 🤍"

    });

  }

});

/*
========================================
SERVER START
========================================
*/
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(3000,()=>{

  console.log("📖 책친구 서버 실행 중");

});
