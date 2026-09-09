'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { capabilityRows, datasets, FilterKey, sources, Tier } from './data';

const nav = [
  ['summary','摘要'],['profile','EgoLife 档案'],['lineage','团队谱系'],['datasets','数据集比较'],['tiers','分层推荐'],['advice','研究建议'],['sources','来源'],
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
      <div className="eyebrow"><span>Research portal · CVPR 2025</span><span>资料检索截止 2026.09.09</span></div>
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

    <section className="section scale-section" aria-labelledby="scale-title">
      <div className="scale-intro"><div><span className="section-no">03</span><p className="eyebrow-text">TIME SCALE LENS</p><h2 id="scale-title">“长”至少有<br/>六种含义</h2></div><p>判断长期记忆 benchmark 时，最关键的是 <strong>evidence-to-query delay</strong> 和同一主体的自然日历跨度。总小时数只能回答“有多少数据”。</p></div>
      <div className="scale-track">{scales.map(([name,range,note],i)=><article key={name}><div className="scale-marker"><span>{i+1}</span></div><p>{name}</p><strong>{range}</strong><small>{note}</small></article>)}</div>
      <div className="rule-callout"><b>判定规则</b><span>总视频规模大</span><i>≠</i><span>单段样本长</span><i>≠</i><span>自然跨度长</span><i>≠</i><span>存在长期记忆任务</span></div>
    </section>

    <section className="section" id="lineage">
      <SectionHead no="04" eyebrow="TEAM & LINEAGE" title={<>从长视频能力<br/>走向持久记忆</>} copy="下列关系基于作者重合、项目陈述与技术目标判断；“方向相近”不等于 EgoLife 的数据续集。" />
      <div className="people-grid">{people.map(([name,role,basis])=><article className="person" key={name}><span>{name.split(' ').map(x=>x[0]).join('')}</span><div><h3>{name}</h3><b>{role}</b><p>{basis}</p></div></article>)}</div>
      <div className="timeline">{timeline.map(([date,name,relation,desc],i)=><article className="timeline-item" key={name}><div className="time-dot">{i+1}</div><time>{date}</time><div><span className={`relation rel-${relation}`}>{relation}</span><h3>{name}</h3><p>{desc}</p></div></article>)}</div>
    </section>

    <section className="section paper-section" id="datasets">
      <SectionHead no="05" eyebrow="DATASET BROWSER" title={<>十五个候选，按真实<br/>研究需求筛选</>} copy="桌面端可查看宽表，移动端自动使用卡片。点击行或“展开”查看相似点、差异与开放条件。" />
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
      <SectionHead no="06" eyebrow="TIERED RECOMMENDATION" title={<>相似度与研究价值<br/>不是一回事</>} copy="A 类接近 EgoLife 的采集或记忆目标；B 类可补足关键能力；C 类适合作为长视频、音频或具身评测补充。" />
      <div className="tier-columns">
        <TierColumn tier="A" title="高度相似" names={['CASTLE 2024','EgoMonth','HD-EPIC','TeleEgo','MM-Lifelong']} />
        <TierColumn tier="B" title="长期记忆强补充" names={['EgoStream','Ego4D','Ego-Exo4D V2','HoloAssist','EgoCom','SAYCam']} />
        <TierColumn tier="C" title="相关能力补充" names={['KrishnaCam','M3-Bench','LongShOTBench','FindingDory']} />
      </div>
      <div className="recommendation-notes">{[['采集结构最接近','CASTLE'],['助手式多日第一视角','TeleEgo'],['物体状态与程序记忆','HD-EPIC'],['严格自然跨天记忆','EgoMonth'],['多源流式遗忘评测','EgoStream'],['第一—第三视角关联','Ego-Exo4D']].map(([label,name])=><div key={name}><span>{label}</span><strong>{name}</strong></div>)}</div>
    </section>

    <section className="section matrix-section" aria-labelledby="matrix-title">
      <div className="matrix-head"><div><span className="section-no">07</span><p className="eyebrow-text">CAPABILITY MATRIX</p><h2 id="matrix-title">能力覆盖矩阵</h2></div><div className="legend"><span><i className="cov strong">●</i> 强覆盖</span><span><i className="cov partial">◐</i> 部分覆盖／需二次标注</span><span><i className="cov missing">○</i> 基本缺失</span></div></div>
      <div className="matrix-scroll"><table className="matrix"><thead><tr><th>数据集 / 组合</th>{['事件记忆','人物关系','地点','物体状态','对话音频','跨天检索','Ego–Exo','开放问答','时间定位'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{capabilityRows.map(row=><tr key={row.name}><th>{row.name}</th>{row.values.map((v,i)=><td key={i}><span className={`cov ${v}`} aria-label={v==='strong'?'强覆盖':v==='partial'?'部分覆盖或需二次标注':'基本缺失'}>{v==='strong'?'●':v==='partial'?'◐':'○'}</span></td>)}</tr>)}</tbody></table></div>
    </section>

    <section className="section dark-section" id="advice">
      <SectionHead no="08" eyebrow="RESEARCH BLUEPRINT" title={<>按目标组装数据，<br/>不要寻找“万能集”</>} copy="训练规模、自然跨度、语音互动、多视角关联与严格记忆延迟通常分散在不同数据集。" />
      <div className="stack-list">{stacks.map(([no,title,data,body])=><article key={no}><span>{no}</span><div><h3>{title}</h3><strong>{data}</strong><p>{body}</p></div></article>)}</div>
      <div className="gap-block"><p className="kicker">WHAT IS STILL MISSING</p><h3>公开数据仍缺少什么？</h3><div>{['同一批成年人跨周／跨月的高密度第一视角音视频','可公开的同步固定第三视角与多传感器原始流','围绕人物关系、对话承诺和状态变化的跨日标注','明确控制 evidence-to-query delay、干扰与答案失效的统一协议'].map(x=><p key={x}>→ {x}</p>)}</div><aside><b>是否需要自采？</b><p>如果目标是“记住几周前某人说过什么，并关联物体状态和第三视角证据”，现有公开数据不足，建议进行受控自采；重点预算应投入隐私、同意、撤回、身份保护和跨日事件图标注。</p></aside></div>
    </section>

    <section className="section source-section" id="sources">
      <SectionHead no="09" eyebrow="SOURCES & CONFIDENCE" title={<>来源、冲突与<br/>可信度边界</>} copy="资料检索截止 2026-09-09。关键事实优先来自论文原文、官方项目页、代码仓库和数据下载页。" />
      <div className="confidence-grid"><article><b>A · 一手明确</b><p>论文、官方项目页、官方仓库或数据卡直接陈述。</p></article><article><b>B · 交叉一致</b><p>至少两个相互独立的一手入口在规模或状态上吻合。</p></article><article><b>C · 合理推断</b><p>基于作者重合、资源可见性或技术关系推断，页面明确保留“推断”标签。</p></article></div>
      <div className="conflict-table"><div><b>冲突项</b><b>网页采用的表达</b></div><div><span>EgoLife 300 h vs 266 h</span><span>前者为 captured，后者为清洗 retained，不合并。</span></div><div><span>3,000 QA vs Jake 500</span><span>分别写为论文构建总量与当前主要公开/评测子集。</span></div><div><span>EgoLife 全部模态</span><span>论文采集设计与当前公开资源分开陈述。</span></div><div><span>CASTLE license</span><span>标注“可下载但条款冲突，使用前询问”。</span></div></div>
      <div className="source-grid">{sources.map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer"><span>{name}</span><b>↗</b></a>)}</div>
      <div className="reading-list"><div><h3>最值得进一步阅读</h3><p>EgoLife · CASTLE · EgoMonth · HD-EPIC · EgoStream</p></div><div><h3>最值得申请或下载</h3><p>CASTLE · EgoMonth · HD-EPIC · TeleEgo · Ego4D / Ego-Exo4D</p></div><div><h3>最接近 EgoLife</h3><p>CASTLE · TeleEgo · MM-Lifelong</p></div><div><h3>严格跨天长期记忆</h3><p>EgoMonth · MM-Lifelong Month · EgoLife / EgoMemReason</p></div></div>
    </section>

    <footer><p><b>EgoLife Research Atlas</b><br/>一份面向长时多模态记忆研究的可交互资料索引。</p><p>基于一手资料交叉核验 · 截止 2026.09.09<br/>不确定内容保留“未确认”或“推断”。</p></footer>
    {showTop && <a className="back-top" href="#top" aria-label="返回顶部">↑</a>}
  </main>;
}

function SectionHead({no,eyebrow,title,copy}:{no:string;eyebrow:string;title:React.ReactNode;copy:string}) { return <div className="section-head"><div><span className="section-no">{no}</span><p className="eyebrow-text">{eyebrow}</p></div><h2>{title}</h2><p>{copy}</p></div>; }
function ProfileCard({title,lines}:{title:string;lines:string[]}) { return <article className="profile-card"><h3>{title}</h3>{lines.map((line,i)=><p key={line}><span>{String(i+1).padStart(2,'0')}</span>{line}</p>)}</article>; }
function DatasetTable({items,expanded,toggle}:{items:typeof datasets;expanded:string[];toggle:(name:string)=>void}) { return <div className="table-wrap"><table className="data-table"><thead><tr><th>数据集</th><th>年份</th><th>视角</th><th>模态 / 音频</th><th>参与者 / 场景</th><th>单段最长</th><th>总时长</th><th>自然跨度</th><th>记忆任务</th><th>开放状态</th><th></th></tr></thead><tbody>{items.map(d=><Fragment key={d.name}><tr className={expanded.includes(d.name)?'open-row':''}><td><span className={`tier tier-${d.tier.toLowerCase()}`}>{d.tier}</span><b>{d.name}</b></td><td>{d.year}</td><td>{d.perspective}</td><td>{d.modalities.slice(0,3).join(' · ')}<small>音频：{d.audio}</small></td><td>{d.participants}</td><td>{d.maxClip}</td><td>{d.totalHours}</td><td>{d.span}<small>{d.continuity}</small></td><td>{d.memoryTasks}</td><td><Status>{d.status}</Status></td><td><button className="expand-button" aria-expanded={expanded.includes(d.name)} onClick={()=>toggle(d.name)}>{expanded.includes(d.name)?'收起':'展开'}</button></td></tr>{expanded.includes(d.name)&&<tr className="detail-row"><td colSpan={11}><div><p><b>与 EgoLife 的相似点</b>{d.similarity}</p><p><b>主要差异</b>{d.difference}</p><p><b>标注</b>{d.annotations}</p><p><b>获取条件</b>{d.access}</p><a href={d.url} target="_blank" rel="noreferrer">论文 / 主页 ↗</a></div></td></tr>}</Fragment>)}</tbody></table></div>; }
function DatasetCards({items,expanded,toggle}:{items:typeof datasets;expanded:string[];toggle:(name:string)=>void}) { return <div className="dataset-cards">{items.map(d=><article key={d.name}><header><span className={`tier tier-${d.tier.toLowerCase()}`}>{d.tier}</span><div><h3>{d.name}</h3><p>{d.year} · {d.perspective}</p></div><Status>{d.status}</Status></header><dl><div><dt>总时长</dt><dd>{d.totalHours}</dd></div><div><dt>自然跨度</dt><dd>{d.span}</dd></div><div><dt>音频</dt><dd>{d.audio}</dd></div><div><dt>连续性</dt><dd>{d.continuity}</dd></div></dl><p>{d.memoryTasks}</p><button className="card-expand" aria-expanded={expanded.includes(d.name)} onClick={()=>toggle(d.name)}>{expanded.includes(d.name)?'收起详情':'展开详情'}</button>{expanded.includes(d.name)&&<div className="card-detail"><p><b>相似点：</b>{d.similarity}</p><p><b>差异：</b>{d.difference}</p><p><b>获取：</b>{d.access}</p><a href={d.url} target="_blank" rel="noreferrer">论文 / 主页 ↗</a></div>}</article>)}</div>; }
function TierColumn({tier,title,names}:{tier:Tier;title:string;names:string[]}) { return <article className={`tier-column tc-${tier.toLowerCase()}`}><header><span>{tier}</span><div><p>TIER {tier}</p><h3>{title}</h3></div></header>{names.map(name=><div className="tier-dataset" key={name}><b>{name}</b><small>{datasets.find(d=>d.name===name)?.similarity}</small></div>)}</article>; }
