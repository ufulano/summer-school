<template>
  <div class="help-page">
    <button class="back-btn" @click="goBack">
      返回
      <el-icon><ArrowLeft /></el-icon>
    </button>
    <div class="layout">
      <aside class="toc">
        <div class="toc-title">目录</div>
        <nav>
          <ul>
            <li v-for="item in tocItems" :key="item.id" :class="['toc-item', item.level]">
              <a :href="'#' + item.id">{{ item.text }}</a>
            </li>
          </ul>
        </nav>
      </aside>
      <div class="notion-page">
        <div class="page-title">帮助中心</div>
        <div class="page-divider"></div>
        <div ref="markdownContainerRef" class="markdown-body" v-html="sanitizedHtml"></div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import mermaid from 'mermaid'
import helpMarkdown from '@/assets/help.md?raw'
import { ArrowLeft } from '@element-plus/icons-vue'

const rawMarkdown = ref(helpMarkdown)
const renderedHtml = ref('')
const sanitizedHtml = ref('')
const markdownContainerRef = ref(null)
const router = useRouter()

// Configure marked v5+
marked.use(markedHighlight({
  highlight(code, lang) {
    if (lang === 'mermaid') {
      return code
    }
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
}))
marked.setOptions({ mangle: false, headerIds: false })

const tocItems = ref([])

function renderMarkdown() {
  // 1) 移除 YAML front-matter
  const withoutFrontMatter = String(rawMarkdown.value).replace(/^---[\s\S]*?---\s*/, '')
  // 2) 渲染 HTML
  renderedHtml.value = marked.parse(withoutFrontMatter)
  sanitizedHtml.value = DOMPurify.sanitize(renderedHtml.value)
  // Build TOC from headings
  const container = document.createElement('div')
  container.innerHTML = sanitizedHtml.value
  // 移除首个 H1，避免与页面标题重复
  const firstH1 = container.querySelector('h1')
  if (firstH1) firstH1.remove()

  // 将 ```mermaid 代码块转换为 <div class="mermaid"> 以便正确渲染
  container.querySelectorAll('pre code.language-mermaid').forEach((codeEl) => {
    const raw = codeEl.textContent || ''
    // 解码 HTML 实体，去掉高亮插入的标签干扰
    const textarea = document.createElement('textarea')
    textarea.innerHTML = raw
    const graphDefinition = textarea.value
    const wrapper = document.createElement('div')
    wrapper.className = 'mermaid'
    wrapper.textContent = graphDefinition
    const pre = codeEl.parentElement
    if (pre && pre.parentElement) {
      pre.parentElement.replaceChild(wrapper, pre)
    }
  })

  const headings = Array.from(container.querySelectorAll('h1, h2, h3'))
  tocItems.value = headings.map((el) => {
    const text = el.textContent || ''
    const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')
    el.setAttribute('id', id)
    return { id, text, level: el.tagName.toLowerCase() }
  })
  sanitizedHtml.value = container.innerHTML
}

async function renderMermaid() {
  try {
    const container = markdownContainerRef.value
    if (!container) return
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' })
    await nextTick()
    const blocks = Array.from(container.querySelectorAll('.mermaid'))
    let index = 0
    for (const el of blocks) {
      const code = el.textContent || ''
      const id = `mermaid-${Date.now()}-${index++}`
      try {
        const { svg } = await mermaid.render(id, code)
        el.innerHTML = svg
      } catch (e) {
        console.error('Mermaid single render error:', e)
      }
    }
  } catch (err) {
    console.error('Mermaid render error:', err)
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(async () => {
  renderMarkdown()
  await renderMermaid()
})

watch(rawMarkdown, async () => {
  renderMarkdown()
  await renderMermaid()
})
</script>

<style scoped>
.help-page {
  padding: 16px 0 48px;
  background: #f7f7f6;
}

.back-btn {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 2000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 50px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid rgba(15,23,42,0.08);
  background: #fff;
  color: #0f172a;
  cursor: pointer;
}
.back-btn:hover {
  background: #f9fafb;
}

.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 980px);
  gap: 16px;
  justify-content: center;
  align-items: start;
}

.toc {
  position: sticky;
  top: 16px;
  align-self: start;
  background: #fff;
  border: 1px solid rgba(15,23,42,0.08);
  border-radius: 10px;
  padding: 10px 12px 8px;
  height: fit-content;
}
.toc-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}
.toc ul { list-style: none; padding: 0; margin: 0; }
.toc-item { margin: 6px 0; }
.toc-item.h1 a { font-weight: 600; }
.toc-item.h2 a { padding-left: 8px; font-size: 14px; }
.toc-item.h3 a { padding-left: 16px; font-size: 13px; color: #6b7280; }
.toc a { color: #374151; text-decoration: none; }
.toc a:hover { color: #006633; }

.notion-page {
  max-width: 980px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border: 1px solid rgba(15,23,42,0.08);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.page-divider {
  height: 1px;
  background: #efefef;
  margin: 14px 0 18px;
}

.markdown-body :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 18px 0;
  letter-spacing: 0.2px;
}

.markdown-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 28px 0 12px;
}

.markdown-body :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 20px 0 10px;
}

.markdown-body :deep(p),
.markdown-body :deep(li) {
  line-height: 1.75;
  font-size: 15.5px;
  color: #1f2328;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.25em;
}

.markdown-body :deep(blockquote) {
  margin: 14px 0;
  padding: 8px 14px;
  background: #f7f6f3;
  border-left: 3px solid #e6e2d7;
  color: #4b5563;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .toc {
    position: relative;
    top: 0;
    order: 2;
    margin-top: 12px;
  }
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #efefef;
  margin: 24px 0;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 18px;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 8px 10px;
  text-align: left;
}
.markdown-body :deep(th) {
  background: #fafafa;
}

.markdown-body :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
  border: 1px solid #e5e7eb;
}

.markdown-body :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.markdown-body :deep(.mermaid) {
  display: block;
  background: #fcfcfc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
}
</style>


