
import fs from 'fs';
import path from 'path';
import MarkdownIt from 'markdown-it';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

const sourceFile = path.resolve(process.cwd(), '使用说明书.md');
const targetFile = path.resolve(process.cwd(), '使用说明书.html');

// Custom render rule for images to embed them as Base64
const defaultRender = md.renderer.rules.image || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const srcIndex = token.attrIndex('src');
    
    if (srcIndex >= 0) {
        let src = token.attrs[srcIndex][1];
        if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
            try {
                const imgPath = path.isAbsolute(src) ? src : path.resolve(process.cwd(), src);
                if (fs.existsSync(imgPath)) {
                    const imgData = fs.readFileSync(imgPath);
                    const ext = path.extname(imgPath).substring(1);
                    const base64Image = Buffer.from(imgData).toString('base64');
                    token.attrs[srcIndex][1] = `data:image/${ext};base64,${base64Image}`;
                }
            } catch (error) {
                console.warn(`Error processing image ${src}:`, error.message);
            }
        }
    }
    token.attrPush(['class', 'manual-image']);
    return defaultRender(tokens, idx, options, env, self);
};

try {
    const markdownContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Customize renderer to add IDs to headers for navigation
    md.renderer.rules.heading_open = function (tokens, idx) {
        const token = tokens[idx];
        const titleToken = tokens[idx + 1];
        const titleContent = titleToken.content;
        const slug = 'section-' + idx; // Simple ID generation
        
        token.attrSet('id', slug);
        token.attrSet('data-title', titleContent);
        
        if (token.tag === 'h2') {
             token.attrSet('class', 'section-header');
        }
        
        return md.renderer.renderToken(tokens, idx, md.options);
    };

    const htmlContent = md.render(markdownContent);

    const finalHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMP使用手册</title>
    <style>
        :root {
            --primary-color: #409eff;
            --text-color: #303133;
            --bg-color: #f5f7fa;
            --sidebar-width: 250px;
            --header-height: 60px;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: var(--text-color);
            background-color: var(--bg-color);
            padding-top: var(--header-height); /* For fixed header */
        }

        /* Top Navigation Bar */
        .top-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--header-height);
            background: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            padding: 0 40px;
        }
        
        .nav-logo {
            font-size: 18px;
            font-weight: bold;
            margin-right: 40px;
            color: var(--primary-color);
        }

        .nav-tabs {
            display: flex;
            height: 100%;
        }

        .nav-tab {
            padding: 0 20px;
            height: 100%;
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 15px;
            color: #606266;
            transition: all 0.3s;
            border-bottom: 2px solid transparent;
        }

        .nav-tab:hover {
            color: var(--primary-color);
        }

        .nav-tab.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
        }

        /* Main Layout */
        .main-container {
            display: flex;
            max-width: 1200px;
            margin: 20px auto;
            gap: 20px;
            padding: 0 20px;
        }

        /* Sidebar Navigation */
        .sidebar {
            width: var(--sidebar-width);
            position: sticky;
            top: calc(var(--header-height) + 20px);
            max-height: calc(100vh - var(--header-height) - 40px);
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
            padding: 15px 0;
            overflow-y: auto;
        }

        .sidebar-title {
            padding: 0 20px;
            font-size: 14px;
            font-weight: bold;
            color: #909399;
            margin-bottom: 10px;
        }

        .anchor-link {
            display: block;
            padding: 8px 20px;
            color: #606266;
            text-decoration: none;
            font-size: 14px;
            border-left: 3px solid transparent;
            transition: all 0.2s;
            cursor: pointer;
        }

        .anchor-link:hover {
            color: var(--primary-color);
            background-color: #ecf5ff;
        }

        .anchor-link.active {
            color: var(--primary-color);
            border-left-color: var(--primary-color);
            background-color: #ecf5ff;
        }

        .anchor-link.sub-link {
            padding-left: 35px;
            font-size: 13px;
        }

        /* Content Area */
        .content {
            flex: 1;
            background: #fff;
            padding: 40px;
            border-radius: 4px;
            box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
            min-height: calc(100vh - 140px);
        }

        /* Content Styles */
        h1, h2, h3 { color: #303133; }
        h1 { margin-top: 0; padding-bottom: 20px; border-bottom: 1px solid #ebeef5; }
        h2 { margin-top: 50px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5; }
        p { line-height: 1.8; color: #606266; margin-bottom: 20px; }
        img.manual-image {
            max-width: 100%;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            padding: 4px;
            box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
            margin: 20px 0;
        }

        /* Tab Content Control */
        .tab-section {
            display: none;
        }
        .tab-section.active {
            display: block;
        }
    </style>
</head>
<body>

    <!-- Top Navigation -->
    <div class="top-nav">
        <div class="nav-logo">PMP使用手册</div>
        <div class="nav-tabs" id="topNavTabs">
            <!-- JavaScript will populate this -->
        </div>
    </div>

    <div class="main-container">
        <!-- Sidebar -->
        <div class="sidebar">
            <div class="sidebar-title">本页导航</div>
            <div id="sidebarLinks">
                <!-- JavaScript will populate this -->
            </div>
        </div>

        <!-- Main Content -->
        <div class="content" id="mainContent">
            ${htmlContent}
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const content = document.getElementById('mainContent');
            const navTabsContainer = document.getElementById('topNavTabs');
            const sidebarLinksContainer = document.getElementById('sidebarLinks');
            
            // Logic to group content into "Top Level Tabs" (H2) and "Sidebar Links" (H3)
            // Strategy: Convert H2s into Top Tabs. When a Tab is active, show its H3s in Sidebar.
            
            // 1. Structure the data
            const sections = [];
            let currentSection = null;
            
            // Improve: wrap content between H2s into div.tab-section
            // Since we receive a flat HTML string, we need to restructure the DOM
            
            const children = Array.from(content.children);
            const newContentContainer = document.createDocumentFragment();
            
            // Create a default "Introduction" section for content before first H2
            let activeTabDiv = document.createElement('div');
            activeTabDiv.className = 'tab-section';
            activeTabDiv.id = 'tab-intro';
            newContentContainer.appendChild(activeTabDiv);
            
            let tabCount = 0;
            const tabs = [{ id: 'tab-intro', title: '首页', subLinks: [] }];
            let currentTab = tabs[0];

            children.forEach(el => {
                if (el.tagName === 'H2') {
                    // Start new tab section
                    tabCount++;
                    const title = el.getAttribute('data-title') || el.innerText;
                    const tabId = 'tab-' + tabCount;
                    
                    activeTabDiv = document.createElement('div');
                    activeTabDiv.className = 'tab-section';
                    activeTabDiv.id = tabId;
                    newContentContainer.appendChild(activeTabDiv);
                    
                    const tabObj = { id: tabId, title: title, subLinks: [] };
                    tabs.push(tabObj);
                    currentTab = tabObj;
                    
                    // Don't append H2 to the view, we use it as Tab Title? 
                    // Or keep it as page header. Let's keep it.
                    activeTabDiv.appendChild(el);
                    
                } else if (el.tagName === 'H3') {
                    const title = el.getAttribute('data-title') || el.innerText;
                    const id = el.getAttribute('id');
                    currentTab.subLinks.push({ id: id, title: title });
                    activeTabDiv.appendChild(el);
                } else {
                     activeTabDiv.appendChild(el);
                }
            });
            
            // Cleanup: If first tab (Home) is empty or just title, maybe merge?
            // For this specific manual, "System Overview" is usually the first H2.
            // Let's filter out empty tabs.
            
            content.innerHTML = '';
            content.appendChild(newContentContainer);
            
            // 2. Render Top Nav
            // Skip the implicit 'intro' tab if it's empty (which effectively it might be if Manual starts with H1 then H2)
            const validTabs = tabs.filter(t => {
                const el = document.getElementById(t.id);
                return el && el.children.length > 0 && t.title !== '首页'; // Simple heuristic
            });
            
            // If we only have H2s, treat them as Tabs.
            
            tabs.forEach((tab, index) => {
                if (tab.title === '首页' && (!document.getElementById(tab.id).innerHTML.trim())) return; // Skip empty intro
                if (tab.title === '首页' && index === 0 && document.getElementById(tab.id).children.length <= 1) return; // Skip if just H1
                
                const tabEl = document.createElement('div');
                tabEl.className = 'nav-tab';
                tabEl.innerText = tab.title;
                tabEl.onclick = () => switchTab(tab.id);
                navTabsContainer.appendChild(tabEl);
                
                // Store element reference
                tab.element = tabEl;
            });

            // 3. Switch Tab Logic
            function switchTab(tabId) {
                // Update Top Nav UI
                tabs.forEach(t => {
                    if(t.element) t.element.classList.remove('active');
                });
                const activeTabObj = tabs.find(t => t.id === tabId);
                if(activeTabObj && activeTabObj.element) activeTabObj.element.classList.add('active');
                
                // Show Content
                document.querySelectorAll('.tab-section').forEach(el => el.classList.remove('active'));
                const activeSection = document.getElementById(tabId);
                if(activeSection) activeSection.classList.add('active');
                
                // Update Sidebar
                renderSidebar(activeTabObj);
                
                window.scrollTo(0, 0);
            }

            function renderSidebar(tabObj) {
                sidebarLinksContainer.innerHTML = '';
                if (!tabObj || !tabObj.subLinks) return;
                
                tabObj.subLinks.forEach(link => {
                    const a = document.createElement('a');
                    a.className = 'anchor-link';
                    a.innerText = link.title;
                    a.onclick = () => {
                        document.querySelectorAll('.anchor-link').forEach(el => el.classList.remove('active'));
                        a.classList.add('active');
                        document.getElementById(link.id).scrollIntoView({ behavior: 'smooth' });
                    };
                    sidebarLinksContainer.appendChild(a);
                });
            }

            // Init
            // Find the first valid tab
            const firstTab = tabs.find(t => t.element);
            if (firstTab) {
                switchTab(firstTab.id);
            }
        });
    </script>
</body>
</html>
    `;

    fs.writeFileSync(targetFile, finalHtml);
    console.log(`Successfully generated Interactive HTML manual at: ${targetFile}`);

} catch (err) {
    console.error('Error generating HTML manual:', err);
    process.exit(1);
}
