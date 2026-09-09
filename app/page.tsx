'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { capabilityRows, datasets, FilterKey, sources, Tier } from './data';

const nav = [
  ['summary','摘要'],['profile','档案'],['collection','采集设计'],['testing','测试原理'],['lineage','团队谱系'],['datasets','数据集比较'],['tiers','推荐'],['advice','研究建议'],['sources','来源'],
];
const insights = [
  ['身份','EgoLife: Towards Egocentric Life Assistant，CVPR 2025 数据集与 benchmark。'],
  ['稀缺结构','6 人在共享公寓共同生活 7 天，事件、关系与空间线索可跨日累积。'],
  ['视角','6 路 Meta Aria 第一视角与 15 路固定 GoPro 第三视角共同构成采集设计。'],
  ['多模态','论文涉及视频、音频、ASR、眼动、IMU、mmWave、WiFi、位姿与 3D；并非全部已公开。'],
  ['开放差距','论文构建 3,000 道题；当前官方主要公开/评测的是 Jake 的 500 道。'],
  ['直接延续','Ego-R1 直接延续 EgoLife 的数据与目标；其余后续项目多为技术迁移或方向相近。'],
  ['最像谁','CASTLE 的多人同住、多日、同步 ego+exo 采集结构与 EgoLife 最接近。'],
  ['不同价值','TeleEgo 偏生活助手；HD-EPIC 强于物体状态；EgoMonth 强于严格跨天记忆。'],
  ['时间判断','单个样本很长与同一人物自然跨度很长必须分开；camera-hours 更不能替代两者。'],
];
const filterOptions: [FilterKey,string][] = [
  ['ego','第一视角'],['egoExo','第一＋第三视角'],['audio','包含音频'],['multimodal','两种以上模态'],['hourRecording','小时级记录'],['crossDay','跨天'],['crossWeek','跨周／跨月'],['memory','长期记忆任务'],['openQA','开放式问答'],['temporal','时间定位'],['accessible','实际可获取'],
];
const timeline = [
  ['2023','PSG4D','前置积累','4D 场景图与动态空间理解，为真实世界多实体建模提供技术背景。'],
  ['2023–24','Octopus · LongVA · LMMs-Eval','前置积累','长视频多模态模型、评测基础设施与统一基准体系。'],
  ['2025.06','EgoLife','本体','Jingkang Yang、Shuai Liu、Hongming Guo、Yuhao Dong、Xiamengwei Zhang、Ziwei Liu 等；建立七日共同生活数据与助手评测。'],
  ['2025','Ego-R1','直接延续','直接使用 EgoLife，将长视频推理与强化学习推进到第一视角生活助手。'],
  ['2025–26','VideoLucy · SimpleStream','技术迁移','沿着长视频建模、流式处理与效率扩展，不是 EgoLife 数据续集。'],
  ['2026','Demo-ICL · EgoTools','方向相近','前者探索 demonstration-based multimodal ICL；后者建立新的第一视角工具使用数据。'],
  ['2026','HippoCamp · FileGram','方向相近','把长期记忆从生活视频扩展到个人数字文件与可检索的持久上下文。'],
];
const people = [
  ['Jingkang Yang','项目主导','第一作者；贯穿数据构建、模型与项目传播，最可能是日常推进者。'],
  ['Ziwei Liu','通讯作者 / PI','通讯作者与 MMLab 负责人，为研究路线与资源组织提供学术领导。'],
  ['Shuai Liu','核心作者','深度参与 EgoLife，并在后续长视频与多模态工作中延续技术路线。'],
  ['Hongming Guo','核心作者','参与数据、评测与方法工作，作者重合支持其核心成员判断。'],
  ['Yuhao Dong','核心作者','参与 EgoLife 及相关长视频/助手研究，承担研究与工程贡献。'],
  ['Xiamengwei Zhang','核心作者','核心作者之一，与项目的数据和评测体系直接相关。'],
];
const scales = [
  ['媒体文件','分钟 → 小时','文件切分方式；不等于一次完整活动。'],['Session','一次佩戴／活动','模型可一次读取的连续上下文。'],['个人累计','同一人的总记录','可很大，但仍可能由许多短片组成。'],['Evidence delay','证据 → 提问间隔','最直接反映模型需要保持记忆多久。'],['自然跨度','天 → 周 → 月','同一人物事件在现实日历中的距离。'],['Camera-hours','多机位时长相加','衡量采集规模，不能当作人类经历时长。'],
];
const stacks = [
  ['01','严格跨天记忆评测','EgoMonth + EgoLife / EgoMemReason + MM-Lifelong Month','优先覆盖跨 session 证据、跨日延迟与多跳问答。EgoLife 原始多模态数据需以实际获批范围为准。'],
  ['02','多模态生活助手训练','Ego4D + HoloAssist + EgoCom + CASTLE + TeleEgo + HD-EPIC','从大规模第一视角预训练，到对话、多人社交、多视角生活与物体状态链，形成互补训练谱系。'],
  ['03','第一—第三视角关联','Ego-Exo4D + CASTLE + EgoLife','Ego-Exo4D 提供最强标定；CASTLE 提供多日共同生活；EgoLife 仅在实际获得 exo 数据后加入。'],
];
const sceneCards = [
  ['居家日常','房间移动、整理、休息、清洁与个人事务；提供空间与习惯线索。'],
  ['会议与规划','围绕 Earth Day party 讨论分工、采购、节目和时间安排。'],
  ['烹饪与分享','做饭、试菜和技能分享；形成物体状态、步骤与协作链。'],
  ['音乐／舞蹈排练','跨多天练习并在活动日兑现，适合测试延迟记忆。'],
  ['装饰与手作','制作和布置派对装饰，留下物体位置与状态变化。'],
  ['购物采购','携带设备外出购买物品；论文说明在商场等地点先取得拍摄许可。'],
  ['观光与外出','把生活史扩展到住宅之外，增加地点与情境切换。'],
  ['派对与社交','第 6 天汇合前期准备、人物关系、表演与多人互动。'],
];
const sopSteps = [
  ['00','前置准备','招募、场地与设备准备。论文未完整披露伦理审批、知情同意和撤回 SOP，不能据此补写。'],
  ['01','佩戴与同步','6 人佩戴 Meta Aria；15 台固定 GoPro 与 2 台 mmWave 覆盖 EgoHouse。'],
  ['02','日间采集','清醒时段每人每天至少记录约 6 h；项目介绍常以约 8 h/day 概括。'],
  ['03','轻度引导','研究人员监看活动；长时间被动状态时给予 gentle prompt，鼓励有意义活动。'],
  ['04','三小时维护','约每 3 h 收回眼镜，上传数据并清理存储；该过程约 1 h。'],
  ['05','保持叙事','维护间隙要求参与者留在房间，休息或做非关键活动，减少故事链断裂。'],
  ['06','恢复记录','重新佩戴并继续；固定第三视角与环境传感器并行记录。'],
  ['07','同步与去敏','EgoSync 对齐多路数据；人脸／车牌模糊、敏感音频静音，再进入标注。'],
];
const guidanceRows = [
  ['共同目标','在第 6 天举办 Earth Day party','产生跨天规划—准备—执行链','研究目标注入了叙事结构，并非完全无任务自然生活'],
  ['每日记录量','清醒时段每人至少约 6 h','确保单人生活史具有足够密度','不是 24×7；缺失时段会影响事件完整性'],
  ['行为干预','长时间被动时给予温和提示','减少大量低信息内容','可能改变自然行为分布，需在泛化时考虑'],
  ['设备维护','约每 3 h 上传并清理，约需 1 h','满足存储与运行约束','形成周期性断点'],
  ['维护间隙','留在房间，休息或做非关键活动','避免关键事件发生在未记录时段','无法保证真正连续，只是降低断裂风险'],
  ['外部场所','在商场等地点先取得拍摄许可','允许扩展到购物、观光等场景','公开文本未给出逐地点的完整许可清单'],
];
const qaTypes = [
  ['EntityLog','实体日志','上次在哪里使用／放置某物？价格、位置和对象历史。'],
  ['EventRecall','事件回忆','过去发生了什么、何时发生、谁参与以及关键细节。'],
  ['HabitInsight','习惯洞察','从多次行为中归纳偏好、重复模式与生活习惯。'],
  ['RelationMap','关系地图','识别人、追踪互动、缺席者与群体关系。'],
  ['TaskMaster','任务助手','依据过往承诺和行动给出提醒、分工或建议。'],
];
const qaFunnel = [
  ['≈100K / 人','候选生成','按五类 prompt，把 visual-audio captions 分批交给 GPT-4o 生成带时间戳候选。'],
  ['SRT 审阅','人工过滤','候选与视频时间同步展示；只作为灵感和筛选入口，不直接当最终题。'],
  ['1K / 人','高质量池','保留证据至少早于提问 5 min、依赖更长历史且有真实助手价值的问题。'],
  ['500 / 人','最终修订','人工改写问题和答案、制作三个干扰项，并标注证据与模态需求。'],
  ['3,000 总题','论文构建','6 人各 500；主论文 quick evaluation 使用 Jake 的 500 题。'],
];

function Status({children}:{children:string}) { return <span className={`status status-${children === '已公开' ? 'open' : children === '需要申请' ? 'request' : children === '部分公开' ? 'partial' : 'unknown'}`}>{children}</span>; }

export default function Home() {
  const [active, setActive] = useState('summary');
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterKey[]>([]);
  const [tier, setTier] = useState<'ALL'|Tier>('ALL');
  const [sort, setSort] = useState('similarity');
  const [view, setView] = useState<'table'|'cards'>('table');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin:'-28% 0px -62% 0px' });
    nav.forEach(([id]) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    const onScroll = () => setShowTop(window.scrollY > 900); window.addEventListener('scroll', onScroll, {passive:true});
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  useEffect(() => {
    const adaptView = () => { if (window.innerWidth <= 820) setView('cards'); };
    adaptView(); window.addEventListener('resize', adaptView);
    return () => window.removeEventListener('resize', adaptView);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return datasets.filter(d => (!q || `${d.name} ${d.perspective} ${d.modalities.join(' ')} ${d.memoryTasks} ${d.similarity}`.toLowerCase().includes(q)) && (tier === 'ALL' || d.tier === tier) && filters.every(key => d.flags[key])).sort((a,b) => sort === 'year' ? b.year-a.year : sort === 'hours' ? b.hoursValue-a.hoursValue : sort === 'span' ? b.spanDays-a.spanDays : sort === 'memory' ? b.memoryScore-a.memoryScore : b.similarityScore-a.similarityScore);
  }, [query, filters, tier, sort]);
  const toggleFilter = (key:FilterKey) => setFilters(current => current.includes(key) ? current.filter(item => item !== key) : [...current,key]);
  const toggleExpanded = (name:string) => setExpanded(current => current.includes(name) ? current.filter(item => item !== name) : [...current,name]);
  const clear = () => { setQuery(''); setFilters([]); setTier('ALL'); setSort('similarity'); };

  return <main id="top">
    <nav className="site-nav" aria-label="主导航">
      <a className="brand" href="#top"><span>EL</span><span>Research Atlas</span></a>
      <button className="menu-button" aria-expanded={menu} aria-label="打开导航" onClick={() => setMenu(!menu)}>目录</button>
      <div className={`nav-links ${menu ? 'is-open' : ''}`}>{nav.map(([id,label]) => <a className={active===id?'active':''} href={`#${id}`} key={id} onClick={() => setMenu(false)}>{label}</a>)}</div>
    </nav>

    <header className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="eyebrow"><span>Research portal · CVPR 2025</span><span>资料检索截止 2026.09.10</span></div>
      <div className="hero-copy"><p className="kicker">EGOCENTRIC LIFE ASSISTANT</p><h1>EgoLife<br/><em>Research Atlas</em></h1><p className="subtitle">EgoLife 数据集、研究团队与<br className="desktop-break"/>长时多模态记忆数据版图</p><div className="hero-actions"><a className="button primary" href="#summary">开始阅读</a><a className="button ghost" href="#datasets">比较 15 个数据集 ↗</a></div></div>
      <aside className="hero-note"><span className="note-index">研究判断 / 01</span><p>多日持续记录<br/><strong>不等于</strong><br/>24×7 无缝连续记录。</p><small>约每 3 小时中断，用于数据导出与设备维护。总camera-hours 也不是个人经历时长。</small></aside>
    </header>

    <section className="stats-band" aria-label="关键统计">{[['06','主要参与者'],['07','自然日历天'],['≈300h','论文采集量'],['≈266h','清洗保留量'],['15','深度比较数据集']].map(([v,l]) => <div className="stat" key={l}><strong>{v}</strong><span>{l}</span></div>)}</section>

    <section className="section" id="summary">
      <SectionHead no="01" eyebrow="EXECUTIVE SUMMARY" title={<>九个结论，定位<br/>EgoLife 的独特价值</>} copy="它的研究意义不只来自视频很长，而来自同一群人在共享空间中形成的多日、多视角、多模态生活历史。" />
      <div className="insight-grid">{insights.map(([title,body],i) => <article className="insight" key={title}><span>{String(i+1).padStart(2,'0')}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section className="section dark-section" id="profile">
      <SectionHead no="02" eyebrow="DATASET DOSSIER" title={<>一份可核验的<br/>EgoLife 数据档案</>} copy="状态标签严格区分论文陈述、当前公开与未确认信息。" />
      <div className="dossier-lead"><div><p className="kicker">FULL TITLE</p><h3><em>EgoLife: Towards Egocentric Life Assistant</em></h3><p>CVPR 2025 · 第一视角生活助手数据集、评测基准与系统原型。</p></div><div className="link-stack"><a target="_blank" rel="noreferrer" href="https://egolife-ai.github.io/">项目主页 ↗</a><a target="_blank" rel="noreferrer" href="https://openaccess.thecvf.com/content/CVPR2025/html/Yang_EgoLife_Towards_Egocentric_Life_Assistant_CVPR_2025_paper.html">论文 ↗</a><a target="_blank" rel="noreferrer" href="https://github.com/EvolvingLMMs-Lab/EgoLife">GitHub ↗</a><a target="_blank" rel="noreferrer" href="https://huggingface.co/datasets/lmms-lab/EgoLife">Hugging Face ↗</a></div></div>
      <div className="dossier-grid">
        <ProfileCard title="采集对象与场景" lines={['6 名主要参与者','共享公寓共同生活 7 天','室内日常、做饭、社交、游戏与外出活动','非 24×7：约每 3 h 导出/清理一次设备']} />
        <ProfileCard title="视角与传感器" lines={['6 × Meta Aria 第一视角','15 × fixed GoPro 第三视角','2 × mmWave 雷达','WiFi、位姿与 3D 见于论文采集设计']} />
        <ProfileCard title="规模与时间" lines={['约 300 h captured（论文）','约 266 h retained（清洗后）','同一群体自然跨度 7 天','单段文件时长：未确认']} />
        <ProfileCard title="模态与标注" lines={['视频、音频、ASR、文本','眼动、IMU、mmWave、WiFi','位姿、3D、人物/事件/物体/对话','各模态公开完整度不一']} />
      </div>
      <div className="task-strip">{['EgoLifeQA','EgoGPT','EgoRAG','EgoButler'].map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong><small>{['长时生活问答','面向生活史的视频语言模型','检索增强的长期记忆','助手式原型系统'][i]}</small></div>)}</div>
      <div className="availability">
        <div><Status>已公开</Status><p>论文、项目页、GitHub、Hugging Face 主资源与 Jake 500 评测集。</p></div>
        <div><Status>部分公开</Status><p>论文共构建 3,000 道题；当前主实验与可见官方评测聚焦 Jake 的 500 道。</p></div>
        <div><span className="status status-claim">论文宣称但未发现</span><p>主 Hugging Face 资源中未发现完整 exo、IMU、mmWave、WiFi、VRS、标定与 3D 原始发布。</p></div>
        <div><Status>未确认</Status><p>统一的数据集许可证、完整隐私流程与全部参与者数据的可申请路径仍需向团队核验。</p></div>
      </div>
    </section>

    <section className="section collection-section" id="collection">
      <SectionHead no="03" eyebrow="COLLECTION & STUDY DESIGN" title={<>场景不是随机堆叠，<br/>而是被设计成一周生活史</>} copy="EgoLife 选择了“自然共同生活 + 一个共享长期目标”的折中方案：既保留真实互动，又让前后事件形成可追踪的叙事链。" />
      <ResearchFigure src="/research/egolife-teaser.webp" alt="EgoLife 官方总览图：七天生活场景、传感器模态与五类问题" caption="官方总览：七天共同生活、传感器组合与 EgoLifeQA 五类任务。图像来自项目官方论文／博客。" source="https://egolife-ai.github.io/blog/" />

      <div className="subsection-heading"><p className="kicker">WHY THIS SETTING</p><h3>Topic 如何从“可控”与“自然”之间长出来</h3><p>官方项目博客披露了三次设计取舍。这里的 topic 不是预写台词，而是能促成跨日事件的生活主题与共同目标。</p></div>
      <div className="design-continuum">
        <article><span>早期尝试</span><h4>碎片化个人活动</h4><p>音乐会、足球比赛等素材真实，但每段彼此独立，难以形成长期人物关系与因果叙事。</p><small>问题：真实，却缺少连续生活史。</small></article>
        <div className="continuum-axis" aria-hidden="true"><i>更自然</i><b>设计折中</b><i>更可控</i></div>
        <article><span>备选方案</span><h4>火锅店结构化场景</h4><p>任务更容易控制和复现，但场景过于专门，参与者行为也更像脚本表演。</p><small>问题：可控，却可能偏离真实生活。</small></article>
        <article className="chosen"><span>最终方案</span><h4>共同生活 + Earth Day party</h4><p>6 人同住 7 天，自主生活；只设置第 6 天举办活动这一共同使命，让会议、采购、排练、烹饪、装饰和社交自然串联。</p><small>结果：半结构化（semi-structured），不是完全无脚本，也不是逐镜头导演。</small></article>
      </div>

      <div className="subsection-heading"><p className="kicker">SCENE TAXONOMY</p><h3>公开资料能确认的场景与活动</h3><p>以下是根据论文与官方博客归纳的活动范围，不是官方发布的穷尽式类别表；未公开的房间级、地点级分布不作猜测。</p></div>
      <div className="scene-grid">{sceneCards.map(([title,body],i)=><article key={title}><span>{String(i+1).padStart(2,'0')}</span><h4>{title}</h4><p>{body}</p></article>)}</div>
      <ResearchFigure src="/research/egohouse.webp" alt="EgoHouse 三维重建、固定相机与毫米波雷达布局，以及多房间场景缩略图" caption="EgoHouse 采集空间：官方图展示了 3D 重建、15 个固定第三视角相机位置、2 个 mmWave 位置与房间示例。它说明覆盖结构，但不是可用于测量的精确施工图。" source="https://egolife-ai.github.io/blog/" />

      <div className="subsection-heading"><p className="kicker">FIELD SOP</p><h3>一天中的采集 SOP：从佩戴到去敏</h3><p>这是依据论文和官方博客重建的“已披露流程”。其中未公开的伦理、设备校准和异常处理细则明确标为未确认。</p></div>
      <ol className="sop-flow">{sopSteps.map(([no,title,body])=><li key={no}><span>{no}</span><div><h4>{title}</h4><p>{body}</p></div></li>)}</ol>
      <div className="guidance-table" role="region" aria-label="参与者指导与偏差"><div className="guidance-row guidance-head"><b>指导项</b><b>对参与者怎么说／怎么做</b><b>研究目的</b><b>方法学影响</b></div>{guidanceRows.map(row=><div className="guidance-row" key={row[0]}>{row.map((cell,i)=><span key={cell} data-label={['指导项','执行','目的','影响'][i]}>{cell}</span>)}</div>)}</div>
      <ResearchFigure src="/research/week-timeline.webp" alt="EgoLife 六名参与者跨七天活动时间线" caption="官方七天活动时间线：不同图标表示活动类型，可观察多人活动重合与跨日节奏；它同时揭示记录是分段的，并非 24×7 无缝流。" source="https://egolife-ai.github.io/blog/" />

      <div className="subsection-heading"><p className="kicker">DATA PIPELINE & FORMATS</p><h3>从 21 路相机到可检索记忆</h3><p>采集模态、加工产物和当前公开文件必须分开看。论文中的 raw pipeline 不等于所有原始流都已下载可得。</p></div>
      <div className="collection-pipeline" aria-label="EgoLife 数据处理流程图">
        <div className="pipe-group"><small>RAW CAPTURE</small><div><b>6 × Aria VRS</b><span>ego video · audio · gaze · IMU</span></div><div><b>15 × GoPro MP4</b><span>fixed exo video</span></div><div><b>Environment</b><span>mmWave · WiFi · pose / 3D</span></div></div>
        <span className="pipe-arrow">→</span>
        <div className="pipe-group"><small>ALIGN & PRIVACY</small><div><b>EgoSync</b><span>多机位时间同步</span></div><div><b>EgoBlur</b><span>人脸／车牌模糊</span></div><div><b>Audio redaction</b><span>敏感音频静音</span></div></div>
        <span className="pipe-arrow">→</span>
        <div className="pipe-group"><small>ANNOTATE</small><div><b>EgoTranscript</b><span>ASR → diarization → 人工复核</span></div><div><b>EgoCaption</b><span>5 min clips · 0.8× narration</span></div><div><b>Visual-audio captions</b><span>1 FPS frames + transcript + caption</span></div></div>
        <span className="pipe-arrow">→</span>
        <div className="pipe-group accent"><small>BENCHMARK</small><div><b>EgoLifeQA</b><span>question · options · target time</span></div><div><b>EgoRAG memory</b><span>30 s clip → hour → day</span></div></div>
      </div>
      <div className="format-grid">
        <article><header><span>论文采集层</span><b>VRS / MP4 / sensor streams</b></header><p>Aria 原始容器、GoPro 视频及传感器／位姿／3D 流构成论文管线。主 HF 发布中没有核实到全部原始模态。</p><code>DAY1_A1_JAKE_… .mp4</code></article>
        <article><header><span>当前主 HF viewer</span><b>video + label</b></header><p>官方主仓库当前约 512 GB、32,001 rows；viewer 暴露视频与标签字段。文件名编码 day、设备／参与者等信息。</p><code>{`{ video: <HF Video>, label: <int> }`}</code></article>
        <article><header><span>时间文本层</span><b>SRT captions</b></header><p>标注按时间区间组织，包含 Action、Interactive instance、Merged caption 与 Visual-audio caption，便于与视频联动审阅。</p><code>00:00:00,466 → 00:00:08,800</code></article>
        <article><header><span>Ego-R1 衍生发布</span><b>JSON / Parquet</b></header><p>后续 Ego-R1 把题目整理为结构化训练／评测文件；这是衍生发布，不应误写成 EgoLife 原始传感器格式。</p><code>ID · query_time · need_audio · target_time · answer</code></article>
      </div>
      <div className="annotation-detail"><article><b>Transcript 处理</b><p>同步 6 路 ego → 合并音轨 → ASR → 说话人分离 → 约 50 h 人工复核 → 再拆回个人可听轨道；重叠说话和“谁听得到谁”是核心难点。</p></article><article><b>Caption 处理</b><p>视频切成 5 min clips，以 0.8× 播放；标注者连续口述，形成 361K 段平均约 2.65 s 的短叙述，再合并为约 25K 段 coherent captions。</p></article><article><b>公开边界</b><p><span className="inference-tag">核验</span> 主 HF 可见 ego MP4／文本；完整 exo、VRS、IMU、mmWave、WiFi、标定和 3D 仍不能按“已完整公开”展示。</p></article></div>
    </section>

    <section className="section testing-section dark-section" id="testing">
      <SectionHead no="04" eyebrow="BENCHMARK & PRINCIPLES" title={<>不是“看完视频答题”，<br/>而是检索一段生活史</>} copy="EgoLifeQA 把问题放在时间轴的较晚位置，要求系统从更早的音视频历史中找证据，再完成身份、事件、习惯、关系或任务推理。" />
      <div className="qa-type-grid">{qaTypes.map(([name,cn,body],i)=><article key={name}><span>0{i+1}</span><h4>{name}</h4><b>{cn}</b><p>{body}</p></article>)}</div>
      <ResearchFigure dark src="/research/egolifeqa.webp" alt="EgoLifeQA 五类问题及其历史证据时间示例" caption="官方 EgoLifeQA 示意：问题在 query time 提出，答案依赖更早的一个或多个 evidence timestamp；五类题强调的记忆对象不同。" source="https://egolife-ai.github.io/blog/" />

      <div className="subsection-heading"><p className="kicker">QUESTION CONSTRUCTION</p><h3>从约十万候选到每人 500 道题</h3><p>大模型负责扩大候选覆盖，人工负责判断“是否真的需要看历史”、校对答案和制造有区分度的干扰项。</p></div>
      <div className="qa-funnel">{qaFunnel.map(([amount,title,body],i)=><article key={amount}><span>{amount}</span><div><b>{title}</b><p>{body}</p></div>{i<qaFunnel.length-1&&<i aria-hidden="true">↓</i>}</article>)}</div>
      <div className="item-anatomy"><div><p className="kicker">ONE BENCHMARK ITEM</p><h3>一道题里实际记录什么</h3><p>可公开／衍生 JSON 中可见的字段使“记多久”和“靠什么模态”变成可审计变量。</p></div><dl><div><dt>query_time</dt><dd>模型被询问的时间点</dd></div><div><dt>question + A/B/C/D</dt><dd>四选一问题与三个干扰项</dd></div><div><dt>target_time</dt><dd>支持答案的历史证据时间</dd></div><div><dt>need_audio</dt><dd>是否必须依赖音频信息</dd></div><div><dt>type</dt><dd>五类问题之一</dd></div><div><dt>certification length</dt><dd>&lt;2 h / 2–6 h / 6–24 h / &gt;24 h</dd></div></dl></div>

      <div className="subsection-heading"><p className="kicker">HOW THE TEST RUNS</p><h3>评测协议：输入、检索、回答、计分</h3><p>主论文 quick evaluation 在 Jake 的 500 题上运行。论文完整构建量是 3,000 题，二者不能互换。</p></div>
      <div className="test-protocol" aria-label="EgoLife 测试流程">
        <article><span>01</span><h4>冻结历史</h4><p>只把 query time 之前的生活记录视为可用记忆；target timestamp 是证据，而非直接喂给模型的答案。</p></article>
        <article><span>02</span><h4>建立记忆</h4><p>长视频模型可直接处理可承受窗口；EgoButler 则先把历史转成 30 s 描述及 hour/day summaries。</p></article>
        <article><span>03</span><h4>按问题检索</h4><p>从 day → hour → clip 逐级缩小范围，再联合文本描述和视觉特征找 top evidence。</p></article>
        <article><span>04</span><h4>证据核验</h4><p>EgoGPT 检查候选片段是否支持问题，避免仅凭摘要或语言先验猜答案。</p></article>
        <article><span>05</span><h4>选择 A–D</h4><p>输出一个选项；主指标为四选一 accuracy。caption-based 对比模型按论文设置以 1 FPS 采样。</p></article>
        <article><span>06</span><h4>分桶诊断</h4><p>按五类题、是否需音频及 certification length 检查退化；论文报告的 3,000 题中 2,003 题证据跨度超过 2 h。</p></article>
      </div>
      <div className="protocol-note"><b>可复现实验应额外报告</b><span>检索 recall@K</span><span>evidence IoU／命中率</span><span>按人物与日期拆分的 accuracy</span><span>不同记忆预算下的吞吐与延迟</span><small>这些是面向严谨复现的建议，不是全部由原论文作为官方主指标报告。</small></div>

      <div className="subsection-heading"><p className="kicker">SYSTEM PRINCIPLE</p><h3>EgoButler：把感知、压缩记忆与回答拆开</h3><p>核心思想是避免把七天原始视频一次性塞入上下文。系统先把音视频变成可检索的分层记忆，再回到原片段做证据核验。</p></div>
      <div className="butler-flow" aria-label="EgoButler 模型框图">
        <div className="model-node input"><small>INPUT STREAM</small><b>30 s ego clips</b><span>RGB + audio</span></div><i>→</i>
        <div className="model-node"><small>PERCEPTION</small><b>EgoGPT</b><span>LLaVA-OneVision / Qwen2 backbone<br/>+ Whisper audio encoder<br/>+ learned audio projector</span></div><i>→</i>
        <div className="model-stack"><div className="model-node"><small>CLIP MEMORY</small><b>visual-audio caption</b></div><div className="model-node"><small>HOUR MEMORY</small><b>hour summary</b></div><div className="model-node"><small>DAY MEMORY</small><b>day summary</b></div></div><i>⇄</i>
        <div className="model-node query"><small>QUERY</small><b>EgoRAG</b><span>keyword / time-range planning<br/>day → hour → clip retrieval<br/>text + visual similarity</span></div><i>→</i>
        <div className="model-node output"><small>VERIFY & ANSWER</small><b>EgoGPT + LLM</b><span>核验 top-k evidence<br/>输出 A / B / C / D</span></div>
      </div>
      <ResearchFigure dark src="/research/egobutler.webp" alt="EgoButler 官方完整系统框图" caption="EgoButler 官方框图：EgoGPT 负责音视频理解与证据核验，EgoRAG 负责把跨天历史压缩为 clip/hour/day 层级并执行粗到细检索。" source="https://egolife-ai.github.io/blog/" />
      <div className="model-figure-grid"><ResearchFigure dark compact src="/research/egogpt.webp" alt="EgoGPT 训练管线图" caption="EgoGPT：在视觉语言底座上加入 Whisper audio encoder 与 audio projector，再用 EgoIT-99K / EgoLife 做监督微调。" source="https://egolife-ai.github.io/blog/" /><ResearchFigure dark compact src="/research/egorag.webp" alt="EgoRAG 分层记忆与检索流程图" caption="EgoRAG：先用 day/hour summaries 定位范围，再在 clip 级联合文本与视觉相关性检索。" source="https://egolife-ai.github.io/blog/" /></div>

      <div className="principle-grid"><article><span>01</span><h4>记忆是检索问题</h4><p>当原始历史远超上下文窗口时，系统性能首先受制于“能否找到证据”，而不是最后一步语言生成。</p></article><article><span>02</span><h4>层级压缩换规模</h4><p>clip → hour → day 降低搜索成本，但摘要是有损的；小物体、语气和短暂状态可能在上卷时消失。</p></article><article><span>03</span><h4>多模态不是拼标签</h4><p>问题可能必须听到承诺、笑声或对话；如果记忆只保存视觉 caption，音频信息会在检索前就丢失。</p></article><article><span>04</span><h4>身份贯穿全链路</h4><p>第一视角里拍摄者通常不露脸，跨机位又有服装变化；person ID 错误会同时污染 caption、检索和关系推理。</p></article><article><span>05</span><h4>检索召回是上限</h4><p>正确证据不在 top-k 中，回答器再强也只能猜；因此 accuracy 应与 evidence recall 一起分析。</p></article><article><span>06</span><h4>时间越长，干扰越强</h4><p>同一物体多次移动、同一承诺反复修改会造成 temporal aliasing；模型必须判断“哪一次”仍然有效。</p></article></div>
      <div className="failure-strip"><b>原论文自报／可观察局限</b><span>speech、laughter、emotion 理解偏弱</span><span>人物身份识别不稳</span><span>Day1 personalization 可能按衣着过拟合</span><span>EgoRAG 单次检索缺少回退机制</span></div>
    </section>

    <section className="section scale-section" aria-labelledby="scale-title">
      <div className="scale-intro"><div><span className="section-no">05</span><p className="eyebrow-text">TIME SCALE LENS</p><h2 id="scale-title">“长”至少有<br/>六种含义</h2></div><p>判断长期记忆 benchmark 时，最关键的是 <strong>evidence-to-query delay</strong> 和同一主体的自然日历跨度。总小时数只能回答“有多少数据”。</p></div>
      <div className="scale-track">{scales.map(([name,range,note],i)=><article key={name}><div className="scale-marker"><span>{i+1}</span></div><p>{name}</p><strong>{range}</strong><small>{note}</small></article>)}</div>
      <div className="rule-callout"><b>判定规则</b><span>总视频规模大</span><i>≠</i><span>单段样本长</span><i>≠</i><span>自然跨度长</span><i>≠</i><span>存在长期记忆任务</span></div>
    </section>

    <section className="section" id="lineage">
      <SectionHead no="06" eyebrow="TEAM & LINEAGE" title={<>从长视频能力<br/>走向持久记忆</>} copy="下列关系基于作者重合、项目陈述与技术目标判断；“方向相近”不等于 EgoLife 的数据续集。" />
      <div className="people-grid">{people.map(([name,role,basis])=><article className="person" key={name}><span>{name.split(' ').map(x=>x[0]).join('')}</span><div><h3>{name}</h3><b>{role}</b><p>{basis}</p></div></article>)}</div>
      <div className="timeline">{timeline.map(([date,name,relation,desc],i)=><article className="timeline-item" key={name}><div className="time-dot">{i+1}</div><time>{date}</time><div><span className={`relation rel-${relation}`}>{relation}</span><h3>{name}</h3><p>{desc}</p></div></article>)}</div>
    </section>

    <section className="section paper-section" id="datasets">
      <SectionHead no="07" eyebrow="DATASET BROWSER" title={<>十五个候选，按真实<br/>研究需求筛选</>} copy="桌面端可查看宽表，移动端自动使用卡片。点击行或“展开”查看相似点、差异与开放条件。" />
      <div className="browser-shell">
        <div className="browser-controls">
          <label className="search"><span>关键词搜索</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="数据集、任务、模态、时间跨度…"/></label>
          <label className="select-label"><span>排序</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="similarity">与 EgoLife 相似度</option><option value="memory">长期记忆适用度</option><option value="year">年份</option><option value="hours">总时长</option><option value="span">自然时间跨度</option></select></label>
          <div className="view-switch" aria-label="切换视图"><button className={view==='table'?'on':''} onClick={()=>setView('table')}>表格</button><button className={view==='cards'?'on':''} onClick={()=>setView('cards')}>卡片</button></div>
        </div>
        <div className="tier-tabs" role="group" aria-label="类别筛选">{(['ALL','A','B','C'] as const).map(value=><button className={tier===value?'on':''} aria-pressed={tier===value} key={value} onClick={()=>setTier(value)}>{value==='ALL'?'全部':`${value} 类`}</button>)}</div>
        <div className="filter-chips">{filterOptions.map(([key,label])=><button className={filters.includes(key)?'on':''} aria-pressed={filters.includes(key)} onClick={()=>toggleFilter(key)} key={key}>{filters.includes(key)?'✓ ':''}{label}</button>)}</div>
        <div className="result-bar"><b>{visible.length}</b> / {datasets.length} 个结果 <button onClick={clear}>清除筛选</button></div>
        {view==='table' ? <DatasetTable items={visible} expanded={expanded} toggle={toggleExpanded}/> : <DatasetCards items={visible} expanded={expanded} toggle={toggleExpanded}/>} 
        {visible.length===0 && <div className="empty">没有满足全部条件的数据集。<button onClick={clear}>清除筛选</button></div>}
      </div>
    </section>

    <section className="section" id="tiers">
      <SectionHead no="08" eyebrow="TIERED RECOMMENDATION" title={<>相似度与研究价值<br/>不是一回事</>} copy="A 类接近 EgoLife 的采集或记忆目标；B 类可补足关键能力；C 类适合作为长视频、音频或具身评测补充。" />
      <div className="tier-columns">
        <TierColumn tier="A" title="高度相似" names={['CASTLE 2024','EgoMonth','HD-EPIC','TeleEgo','MM-Lifelong']} />
        <TierColumn tier="B" title="长期记忆强补充" names={['EgoStream','Ego4D','Ego-Exo4D V2','HoloAssist','EgoCom','SAYCam']} />
        <TierColumn tier="C" title="相关能力补充" names={['KrishnaCam','M3-Bench','LongShOTBench','FindingDory']} />
      </div>
      <div className="recommendation-notes">{[['采集结构最接近','CASTLE'],['助手式多日第一视角','TeleEgo'],['物体状态与程序记忆','HD-EPIC'],['严格自然跨天记忆','EgoMonth'],['多源流式遗忘评测','EgoStream'],['第一—第三视角关联','Ego-Exo4D']].map(([label,name])=><div key={name}><span>{label}</span><strong>{name}</strong></div>)}</div>
    </section>

    <section className="section matrix-section" aria-labelledby="matrix-title">
      <div className="matrix-head"><div><span className="section-no">09</span><p className="eyebrow-text">CAPABILITY MATRIX</p><h2 id="matrix-title">能力覆盖矩阵</h2></div><div className="legend"><span><i className="cov strong">●</i> 强覆盖</span><span><i className="cov partial">◐</i> 部分覆盖／需二次标注</span><span><i className="cov missing">○</i> 基本缺失</span></div></div>
      <div className="matrix-scroll"><table className="matrix"><thead><tr><th>数据集 / 组合</th>{['事件记忆','人物关系','地点','物体状态','对话音频','跨天检索','Ego–Exo','开放问答','时间定位'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{capabilityRows.map(row=><tr key={row.name}><th>{row.name}</th>{row.values.map((v,i)=><td key={i}><span className={`cov ${v}`} aria-label={v==='strong'?'强覆盖':v==='partial'?'部分覆盖或需二次标注':'基本缺失'}>{v==='strong'?'●':v==='partial'?'◐':'○'}</span></td>)}</tr>)}</tbody></table></div>
    </section>

    <section className="section dark-section" id="advice">
      <SectionHead no="10" eyebrow="RESEARCH BLUEPRINT" title={<>按目标组装数据，<br/>不要寻找“万能集”</>} copy="训练规模、自然跨度、语音互动、多视角关联与严格记忆延迟通常分散在不同数据集。" />
      <div className="stack-list">{stacks.map(([no,title,data,body])=><article key={no}><span>{no}</span><div><h3>{title}</h3><strong>{data}</strong><p>{body}</p></div></article>)}</div>
      <div className="gap-block"><p className="kicker">WHAT IS STILL MISSING</p><h3>公开数据仍缺少什么？</h3><div>{['同一批成年人跨周／跨月的高密度第一视角音视频','可公开的同步固定第三视角与多传感器原始流','围绕人物关系、对话承诺和状态变化的跨日标注','明确控制 evidence-to-query delay、干扰与答案失效的统一协议'].map(x=><p key={x}>→ {x}</p>)}</div><aside><b>是否需要自采？</b><p>如果目标是“记住几周前某人说过什么，并关联物体状态和第三视角证据”，现有公开数据不足，建议进行受控自采；重点预算应投入隐私、同意、撤回、身份保护和跨日事件图标注。</p></aside></div>
    </section>

    <section className="section source-section" id="sources">
      <SectionHead no="11" eyebrow="SOURCES & CONFIDENCE" title={<>来源、冲突与<br/>可信度边界</>} copy="资料检索截止 2026-09-10。关键事实优先来自论文原文、官方项目页、代码仓库和数据下载页。" />
      <div className="confidence-grid"><article><b>A · 一手明确</b><p>论文、官方项目页、官方仓库或数据卡直接陈述。</p></article><article><b>B · 交叉一致</b><p>至少两个相互独立的一手入口在规模或状态上吻合。</p></article><article><b>C · 合理推断</b><p>基于作者重合、资源可见性或技术关系推断，页面明确保留“推断”标签。</p></article></div>
      <div className="conflict-table"><div><b>冲突项</b><b>网页采用的表达</b></div><div><span>EgoLife 300 h vs 266 h</span><span>前者为 captured，后者为清洗 retained，不合并。</span></div><div><span>3,000 QA vs Jake 500</span><span>分别写为论文构建总量与当前主要公开/评测子集。</span></div><div><span>EgoLife 全部模态</span><span>论文采集设计与当前公开资源分开陈述。</span></div><div><span>CASTLE license</span><span>标注“可下载但条款冲突，使用前询问”。</span></div></div>
      <div className="source-grid">{sources.map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer"><span>{name}</span><b>↗</b></a>)}</div>
      <div className="reading-list"><div><h3>最值得进一步阅读</h3><p>EgoLife · CASTLE · EgoMonth · HD-EPIC · EgoStream</p></div><div><h3>最值得申请或下载</h3><p>CASTLE · EgoMonth · HD-EPIC · TeleEgo · Ego4D / Ego-Exo4D</p></div><div><h3>最接近 EgoLife</h3><p>CASTLE · TeleEgo · MM-Lifelong</p></div><div><h3>严格跨天长期记忆</h3><p>EgoMonth · MM-Lifelong Month · EgoLife / EgoMemReason</p></div></div>
    </section>

    <footer><p><b>EgoLife Research Atlas</b><br/>一份面向长时多模态记忆研究的可交互资料索引。</p><p>基于一手资料交叉核验 · 截止 2026.09.10<br/>不确定内容保留“未确认”或“推断”。</p></footer>
    {showTop && <a className="back-top" href="#top" aria-label="返回顶部">↑</a>}
  </main>;
}

function SectionHead({no,eyebrow,title,copy}:{no:string;eyebrow:string;title:React.ReactNode;copy:string}) { return <div className="section-head"><div><span className="section-no">{no}</span><p className="eyebrow-text">{eyebrow}</p></div><h2>{title}</h2><p>{copy}</p></div>; }
function ResearchFigure({src,alt,caption,source,dark=false,compact=false}:{src:string;alt:string;caption:string;source:string;dark?:boolean;compact?:boolean}) { return <figure className={`research-figure ${dark?'figure-dark':''} ${compact?'figure-compact':''}`}><a href={src} target="_blank" aria-label={`查看大图：${alt}`}>
  {/* Locally optimized WebP research figures retain their original aspect ratios. */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={src} alt={alt} loading="lazy" /></a><figcaption><span>{caption}</span><a href={source} target="_blank" rel="noreferrer">官方来源 ↗</a></figcaption></figure>; }
function ProfileCard({title,lines}:{title:string;lines:string[]}) { return <article className="profile-card"><h3>{title}</h3>{lines.map((line,i)=><p key={line}><span>{String(i+1).padStart(2,'0')}</span>{line}</p>)}</article>; }
function DatasetTable({items,expanded,toggle}:{items:typeof datasets;expanded:string[];toggle:(name:string)=>void}) { return <div className="table-wrap"><table className="data-table"><thead><tr><th>数据集</th><th>年份</th><th>视角</th><th>模态 / 音频</th><th>参与者 / 场景</th><th>单段最长</th><th>总时长</th><th>自然跨度</th><th>记忆任务</th><th>开放状态</th><th></th></tr></thead><tbody>{items.map(d=><Fragment key={d.name}><tr className={expanded.includes(d.name)?'open-row':''}><td><span className={`tier tier-${d.tier.toLowerCase()}`}>{d.tier}</span><b>{d.name}</b></td><td>{d.year}</td><td>{d.perspective}</td><td>{d.modalities.slice(0,3).join(' · ')}<small>音频：{d.audio}</small></td><td>{d.participants}</td><td>{d.maxClip}</td><td>{d.totalHours}</td><td>{d.span}<small>{d.continuity}</small></td><td>{d.memoryTasks}</td><td><Status>{d.status}</Status></td><td><button className="expand-button" aria-expanded={expanded.includes(d.name)} onClick={()=>toggle(d.name)}>{expanded.includes(d.name)?'收起':'展开'}</button></td></tr>{expanded.includes(d.name)&&<tr className="detail-row"><td colSpan={11}><div><p><b>与 EgoLife 的相似点</b>{d.similarity}</p><p><b>主要差异</b>{d.difference}</p><p><b>标注</b>{d.annotations}</p><p><b>获取条件</b>{d.access}</p><a href={d.url} target="_blank" rel="noreferrer">论文 / 主页 ↗</a></div></td></tr>}</Fragment>)}</tbody></table></div>; }
function DatasetCards({items,expanded,toggle}:{items:typeof datasets;expanded:string[];toggle:(name:string)=>void}) { return <div className="dataset-cards">{items.map(d=><article key={d.name}><header><span className={`tier tier-${d.tier.toLowerCase()}`}>{d.tier}</span><div><h3>{d.name}</h3><p>{d.year} · {d.perspective}</p></div><Status>{d.status}</Status></header><dl><div><dt>总时长</dt><dd>{d.totalHours}</dd></div><div><dt>自然跨度</dt><dd>{d.span}</dd></div><div><dt>音频</dt><dd>{d.audio}</dd></div><div><dt>连续性</dt><dd>{d.continuity}</dd></div></dl><p>{d.memoryTasks}</p><button className="card-expand" aria-expanded={expanded.includes(d.name)} onClick={()=>toggle(d.name)}>{expanded.includes(d.name)?'收起详情':'展开详情'}</button>{expanded.includes(d.name)&&<div className="card-detail"><p><b>相似点：</b>{d.similarity}</p><p><b>差异：</b>{d.difference}</p><p><b>获取：</b>{d.access}</p><a href={d.url} target="_blank" rel="noreferrer">论文 / 主页 ↗</a></div>}</article>)}</div>; }
function TierColumn({tier,title,names}:{tier:Tier;title:string;names:string[]}) { return <article className={`tier-column tc-${tier.toLowerCase()}`}><header><span>{tier}</span><div><p>TIER {tier}</p><h3>{title}</h3></div></header>{names.map(name=><div className="tier-dataset" key={name}><b>{name}</b><small>{datasets.find(d=>d.name===name)?.similarity}</small></div>)}</article>; }
