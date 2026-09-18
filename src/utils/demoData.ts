export interface DemoArticle {
  id: string;
  name: string;
  size: string;
  modifiedTime: string;
  html: string;
}

export const DEMO_ARTICLES: DemoArticle[] = [
  {
    id: 'demo-1',
    name: '深入理解现代 Web 阅读器设计与排版艺术.html',
    size: '18 KB',
    modifiedTime: '2026-03-15T10:30:00Z',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>深入理解现代 Web 阅读器设计与排版艺术</title>
  <meta name="author" content="Antigravity Design Team">
</head>
<body>
  <article>
    <header>
      <h1>深入理解现代 Web 阅读器设计与排版艺术</h1>
      <p class="meta">作者：Antigravity Design Team · 发布于 2026年3月 · 阅读时长约 5 分钟</p>
    </header>
    
    <p>在数字化阅读日益普及的今天，网页文章已成为人们获取信息的主要媒介之一。然而，复杂的网页广告、杂乱的侧边栏、不合理的字号与行距，往往会极大地消耗读者的专注力。一个优秀的阅读器，其核心使命就是<strong>消除干扰，让读者回归纯粹的文字沉浸</strong>。</p>

    <h2>一、为什么需要排版阅读模式</h2>
    <p>原生网页通常是为“导航与商业转换”设计的，而非为“深度阅读”设计。当我们把网页保存为 HTML 文件时，传统的浏览器往往以原始的网页排版打开它，这存在诸多痛点：</p>
    <ul>
      <li><strong>视觉噪音过多</strong>：悬浮挂件、无关推荐模块和多栏排版分散注意力。</li>
      <li><strong>字体与字号不可调</strong>：难以适应不同环境（如强光下的移动端，或是视力疲劳时的夜间模式）。</li>
      <li><strong>长文缺乏导航</strong>：对于万字长文，缺少自动提取的大纲目录，跳转极其费力。</li>
    </ul>

    <blockquote>
      “排版的本质不是为了装饰，而是为了消除读者与思想之间的障碍。” —— 罗伯特·布林赫斯特《排版风格的要素》
    </blockquote>

    <h2>二、核心阅读体验要素</h2>
    <p>为了给读者提供媲美甚至超越纸质书的阅读体验，我们需要从以下几个维度进行精细打磨：</p>

    <h3>1. 舒适的色彩搭配与主题切换</h3>
    <p>不同场景需要不同的色温与对比度：</p>
    <ul>
      <li><strong>浅色模式 (Light)</strong>：柔和的高雅灰白底色，避免刺眼的纯白色。</li>
      <li><strong>羊皮纸 (Sepia)</strong>：复古温暖的纸质色调，非常适合自然光下长时间阅读。</li>
      <li><strong>护眼绿 (Eye-Care Green)</strong>：降低蓝光刺激，缓解睫状肌紧张。</li>
      <li><strong>深色与午夜蓝 (Dark & Midnight)</strong>：低环境光下的舒适之选，文字采用低对比度银灰色。</li>
    </ul>

    <h3>2. 科学的字号与行距黄金比例</h3>
    <p>在中文排版中，行距（Line-height）建议控制在 <code>1.7 ~ 1.9</code> 倍之间，行宽建议保持在每行 <code>35 ~ 45</code> 个汉字（约 650px ~ 800px），避免眼球过度水平移动导致疲劳。</p>

    <h2>三、移动端体验适配实战</h2>
    <p>现代阅读有超过 70% 发生在移动设备上。在小屏设备上，阅读器需要做出针对性重构：</p>
    <table>
      <thead>
        <tr>
          <th>特性维度</th>
          <th>传统桌面端</th>
          <th>移动触屏端适配方案</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>目录导航 (TOC)</td>
          <td>常驻左右分栏侧边栏</td>
          <td>抽屉式滑出（Drawer），点击自动闭合跳转</td>
        </tr>
        <tr>
          <td>阅读控制项</td>
          <td>顶部完整导航栏</td>
          <td>单手可及的悬浮底栏（Mobile Bottom Bar）</td>
        </tr>
        <tr>
          <td>沉浸模式</td>
          <td>手动全屏按钮</td>
          <td>向上轻滑自动隐藏导航，向下轻滑或轻触唤出</td>
        </tr>
      </tbody>
    </table>

    <h2>四、代码示例与架构解析</h2>
    <p>下面是一个使用 DOMPurify 与 Readability 解析正文的核心逻辑示例：</p>
    <pre><code>// 智能提取正文与大纲目录
import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';

export function parseArticle(doc) {
  const reader = new Readability(doc);
  const article = reader.parse();
  const cleanHtml = DOMPurify.sanitize(article.content);
  return { title: article.title, content: cleanHtml };
}</code></pre>

    <h2>五、结语</h2>
    <p>无论是 Google Drive 中保存的技术专栏、学术论文还是网络长文，一个兼具纯净排版与原网页查看的阅读器，都能成为读者探索知识的得力伴侣。愿每一次阅读都舒适而专注。</p>
  </article>
</body>
</html>`
  },
  {
    id: 'demo-2',
    name: '科技快讯：人工智能与空间计算的交汇点.html',
    size: '12 KB',
    modifiedTime: '2026-02-28T14:15:00Z',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>科技前沿：人工智能与空间计算的交汇点</title>
</head>
<body>
  <header>
    <h1>科技前沿：人工智能与空间计算的交汇点</h1>
    <p>作者：未来科技观察 · 分类：前沿趋势</p>
  </header>
  <main>
    <p>随着多模态大模型与下一代轻量化空间计算设备的成熟，人机交互正在经历从二维屏幕向三维环境感知的根本性跨越。</p>
    
    <h2>1. 空间智能 (Spatial Intelligence) 的崛起</h2>
    <p>传统的计算机视觉通常关注从单个图像中识别人脸或物体，而空间智能则要求系统在物理三维空间中构建完整的世界模型，推断物体的物理属性、因果关系以及未来的运动轨迹。</p>

    <h2>2. 端侧多模态协同</h2>
    <p>通过端云协同的微型模型，眼镜类设备可以实时解析佩戴者视线聚焦的内容，提供毫无延迟的实时同传、意图预判与虚拟辅助叠加。</p>

    <blockquote>
      “我们不再是在操作一台计算机，而是在与周围的环境自然共存与对话。”
    </blockquote>

    <h2>3. 隐私与安全边界</h2>
    <p>全天候的摄像头与传感器输入，对端侧隐私计算提出了前所未有的严苛要求。所有的环境点云与人脸特征提取都必须在安全的芯片隔离区（Secure Enclave）内完成，严禁未经授权的数据回传。</p>
  </main>
</body>
</html>`
  },
  {
    id: 'demo-3',
    name: '古典散文精选：秋水时至.html',
    size: '8 KB',
    modifiedTime: '2026-01-10T08:00:00Z',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>庄子·秋水篇精读与赏析</title>
</head>
<body>
  <article>
    <h1>庄子·秋水篇精读与赏析</h1>
    <p>秋水时至，百川灌河。泾流之大，两涘渚崖之间，不辩牛马。于是焉，河伯欣然自喜，以天下之美为尽在己。顺流而东行，至于北海。东面而视，不见水端。</p>

    <h2>一、望洋向若而叹</h2>
    <p>于是焉，河伯始旋其面目，望洋向若而叹曰：“野语有之曰：‘闻道百，以为莫己若’者，我之谓也。且夫我尝闻少仲尼之闻，而轻伯夷之义者，始吾弗信，今我睹子之难穷也，吾非至于子之门，则殆矣，吾长见笑于大方之家。”</p>

    <h2>二、北海若之答</h2>
    <p>北海若曰：“井蛙不可以语于海者，拘于虚也；夏虫不可以语于冰者，笃于时也；曲士不可以语于道者，束于教也。今尔出于崖涘，观于大海，乃知尔丑，尔将可与语大理矣。”</p>

    <blockquote>
      “天下之水，莫大于海。万川归之，不知何时止而不盈；尾闾泄之，不知何时已而不虚；春秋不变，水旱不知。此其过江河之流，不可为量数。而吾未尝以此自贺者，自以比形于天地，而受气于阴阳，吾在天地之间，犹小石小木之在大山也。”
    </blockquote>
  </article>
</body>
</html>`
  }
];
