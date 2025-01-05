import { marked } from 'marked';

export const getDiaries = async () => {
    try {
        // 获取 dataFiles.json 中的文件列表
        const response = await fetch('/data/dataFiles.json');
        if (!response.ok) {
            throw new Error('无法加载 dataFiles.json');
        }

        const dataFiles = await response.json();
        let articles = [];

        // 逐个加载和解析每个 Markdown 文件
        for (const file of dataFiles) {
            const res = await fetch(`/data/${file}`);
            if (!res.ok) {
                console.warn(`无法加载文件: ${file}`);
                continue;
            }

            const fileContent = await res.text();

            // 使用正则表达式提取文章信息
            const entryPattern = /####\s+(\d{4}年\d{1,2}月\d{1,2}日)\s+#####\s+(.+?)\s+([\s\S]*?)(?=####\s+\d{4}年\d{1,2}月\d{1,2}日|$)/g;
            let match;
            while ((match = entryPattern.exec(fileContent)) !== null) {
                const dateStr = match[1]; // 例如："2025年1月1日"
                const title = match[2];    // 标题
                const bodyMarkdown = match[3]; // 正文内容
                const body = marked.parse(bodyMarkdown); // 将 Markdown 转换为 HTML

                // 将日期字符串转换为 Date 对象以便排序
                const dateParts = /(\d{4})年(\d{1,2})月(\d{1,2})日/.exec(dateStr);
                if (dateParts) {
                    const year = parseInt(dateParts[1], 10);
                    const month = parseInt(dateParts[2], 10) - 1; // 月份从0开始
                    const day = parseInt(dateParts[3], 10);
                    const date = new Date(year, month, day);

                    articles.push({ date, title, body });
                } else {
                    console.warn(`日期格式不正确: ${dateStr}`);
                }
            }
        }

        // 按日期降序排序，最新的在前
        articles.sort((a, b) => b.date - a.date);

        return articles;
    } catch (error) {
        console.error('获取日记失败:', error);
        return [];
    }
}; 