const data=[
['CASTLE 2024',2025,'A','600+ camera-hours','连续 4 天',1,1,'同步 ego+fixed exo，多人共同生活；全库检索与开放 QA','https://castle-dataset.github.io/'],
['EgoMonth',2026,'A','301 h','20–120 天/人',0,1,'20 人真实生活；严格跨 session、跨日记忆','https://arxiv.org/html/2608.13113'],
['HD-EPIC',2025,'A','41.3 h','至少 3 天/人',1,1,'家庭厨房；物体状态、声音、程序与 3D 记忆','https://hd-epic.github.io/site/'],
['TeleEgo',2025,'A','70+ h','连续 3 天/人',1,1,'生活助手式音视频、ASR、narration 与 QA','https://teleai-uagi.github.io/TeleEgo/'],
['MM-Lifelong',2026,'A','181.1 h','最长 51 天',1,1,'Day / Week / Month lifelog；跨小时/日 multi-hop','https://arxiv.org/html/2603.05484'],
['EgoStream',2026,'B','无新增 raw hours','最长由 EgoLife 贡献',0,1,'重组多源数据；严格 streaming 与 recall delay','https://arxiv.org/html/2605.31557'],
['Ego4D',2022,'B','3,670 h','无统一跨日协议',1,0,'大规模第一视角与 episodic retrieval','https://ego4d-data.org/'],
['Ego-Exo4D V2',2024,'B','1,286.3 camera-hours','无统一跨日协议',1,0,'精确同步标定的 ego—exo 技能演示','https://discuss.ego4d-data.org/t/ego-exo4d-v2-full-ego-exo4d-release/552'],
['HoloAssist',2023,'B','166 h','无跨天协议',1,0,'语音指导、错误与干预的第一视角助手','https://holoassist.github.io/data_links/README.html'],
['EgoCom',2020,'B','38.5 camera-hours','未确认',1,0,'多人同步第一视角对话与 speaker 标注','https://github.com/facebookresearch/EgoCom-Dataset'],
['SAYCam',2021,'B','>415 至 500+ h','约 2–2.5 年',1,1,'儿童头戴视角；长期规则抽样','https://pmc.ncbi.nlm.nih.gov/articles/PMC8412186/'],
['KrishnaCam',2016,'C','70 h','9 个月',0,1,'单人视觉、GPS 与运动；无音频或 QA','https://krsingh.cs.ucdavis.edu/krishna_files/papers/krishnacam/krishnacam.html'],
['M3-Bench',2026,'C','约 473.4 h（推算）','无跨天协议',1,0,'多证据、多跳、跨模态开放问答','https://m3-agent.github.io/'],
['LongShOTBench',2026,'C','约 188 h','无',1,0,'语音与环境音的开放式长视频 QA','https://longshot.cvmbzuai.com/'],
['FindingDory',2025,'C','未报告','模拟 episode',0,0,'具身智能体对过去物体状态的记忆','https://findingdorybenchmark.github.io/']];
const q=document.querySelector('#q'),tier=document.querySelector('#tier'),audio=document.querySelector('#audio'),cross=document.querySelector('#cross'),cards=document.querySelector('#cards'),count=document.querySelector('#count');
function render(){const term=q.value.toLowerCase();const rows=data.filter(x=>(!term||x.join(' ').toLowerCase().includes(term))&&(!tier.value||x[2]===tier.value)&&(!audio.checked||x[5])&&(!cross.checked||x[6]));count.textContent=`${rows.length} / ${data.length} 个结果`;cards.innerHTML=rows.map(x=>`<article class="card"><header><div><h3>${x[0]}</h3><small>${x[1]} · ${x[3]}</small></div><span class="badge">${x[2]}</span></header><p><b>自然跨度：</b>${x[4]}</p><p>${x[7]}</p><a href="${x[8]}" target="_blank" rel="noreferrer">论文 / 主页 ↗</a></article>`).join('')}
[q,tier,audio,cross].forEach(x=>x.addEventListener('input',render));document.querySelector('#clear').addEventListener('click',()=>{q.value='';tier.value='';audio.checked=false;cross.checked=false;render()});render();
