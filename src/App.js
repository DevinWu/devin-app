import React, { useState, useEffect } from 'react';
import './App.css';
import { getDiaries } from './api/getDiaries';
import { marked } from 'marked';
import { FaBars, FaTimes } from 'react-icons/fa';

function App() {
    const [articles, setArticles] = useState([]);
    const [images, setImages] = useState([]);
    const [descriptions, setDescriptions] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeTab, setActiveTab] = useState('life');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lifeContent, setLifeContent] = useState(''); // State for life content
    const [toc, setToc] = useState([]); // State for table of contents
    const [isTocOpen, setIsTocOpen] = useState(false); // State for TOC visibility in mobile

    useEffect(() => {
        // Fetch articles
        getDiaries().then(data => {
            setArticles(data);
            if (data.length > 0) {
                const sortedArticles = [...data].sort((a, b) => {
                    // Example sorting logic based on date or title
                    return new Date(b.date) - new Date(a.date);
                });
                setSelectedArticle(sortedArticles[0]);
            }
        });

        // Fetch images
        fetch('/img/imageList.json')
            .then(response => response.json())
            .then(data => {
                const imageNames = Object.keys(data);
                setImages(imageNames);
                setDescriptions(data);
            })
            .catch(error => console.error('Error loading image list:', error));

        // Fetch life content
        fetch('/life/index.md')
            .then(response => response.text())
            .then(text => {
                const renderer = new marked.Renderer();
                const tocItems = [];

                renderer.heading = function (text, level) {
                    if (level <= 3) { // Only include up to level 3 headings
                        const anchor = text.toLowerCase().trim().replace(/[^\w]+/g, '-');
                        tocItems.push({ text, level, anchor });
                        return `<h${level} id="${anchor}">${text}</h${level}>`;
                    }
                    return `<h${level}>${text}</h${level}>`;
                };

                setLifeContent(marked(text, { renderer }));
                setToc(tocItems);
            })
            .catch(error => console.error('Error loading life content:', error));
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleToc = () => {
        setIsTocOpen(!isTocOpen);
    };

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const handleArticleClick = (article) => {
        setSelectedArticle(article);
    };

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
        setIsSidebarOpen(false);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === 'logs') {
            const sortedArticles = [...articles].sort((a, b) => {
                // Example sorting logic based on date or title
                return new Date(b.date) - new Date(a.date);
            });
            setSelectedArticle(sortedArticles[0]);
        } else {
            setSelectedArticle(null);
        }
    };

    const formatChineseDate = (dateStr) => {
        if (dateStr instanceof Date) {
            return dateStr.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            }).replace(/\//, '年').replace(/\//, '月') + '日';
        }
        
        if (typeof dateStr === 'string' && dateStr.startsWith('#### ')) {
            return dateStr.substring(5);
        }
        
        return String(dateStr || '');
    };

    const scrollToHeading = (anchor) => {
        console.log(`Anchor: ${anchor}`);
        const element = document.getElementById(anchor);
        if (element) {
            const headerOffset = document.querySelector('.header').offsetHeight; // Get the header height
            const elementPosition = element.getBoundingClientRect().top + window.scrollY; // Get the element's position relative to the document
            const offsetPosition = elementPosition - headerOffset - 20; // Adjust for header height and additional space

            // Log the anchor, element text, and offset position
            console.log(`Element Text: ${element.textContent}`);
            console.log(`Offset Position: ${offsetPosition}`);

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        } else {
            console.log(`Element with anchor ${anchor} not found.`);
        }
    };

    return (
        <div className="App">
            <header className="header">
                <h1>Devin Wu's Personal Blog</h1>
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'life' ? 'active' : ''}`}
                        onClick={() => handleTabClick('life')}
                    >
                        人生
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => handleTabClick('logs')}
                    >
                        文章
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
                        onClick={() => handleTabClick('images')}
                    >
                        图片
                    </button>
                </div>
                {activeTab === 'images' && (
                    <button className="toggle-sidebar" onClick={toggleSidebar}>
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}
                {activeTab === 'life' && (
                    <button className="toggle-toc-icon" onClick={toggleToc}>
                        {isTocOpen ? <FaTimes /> : <FaBars />}
                    </button>
                )}
            </header>
            <div className="main-content">
                {activeTab === 'life' && (
                    <section className="life-section">
                        <div className={`life-sidebar ${isTocOpen ? 'open' : ''}`}>
                            <h2>目录</h2>
                            <ul>
                                {toc.map((item, index) => (
                                    <li key={index} style={{ marginLeft: `${(item.level - 1) * 20}px` }}>
                                        <a href={`#${item.anchor}`} onClick={(e) => { e.preventDefault(); scrollToHeading(item.anchor); setIsTocOpen(false); }}>
                                            {item.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="life-content" onClick={() => setIsTocOpen(false)} dangerouslySetInnerHTML={{ __html: lifeContent }} />
                    </section>
                )}
                {activeTab === 'logs' && (
                    <section className="logs-section">
                        <div className="logs-list">
                            <h2>文章列表</h2>
                            <ul>
                                {articles.map((article, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleArticleClick(article)}
                                        className={`article-item ${selectedArticle === article ? 'selected' : ''}`}
                                    >
                                        <h4>{article.title}</h4>
                                        <p>{formatChineseDate(article.date)}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="logs-content">
                            {selectedArticle ? (
                                <div className="article-content">
                                    <h3>{selectedArticle.title}</h3>
                                    <p>{formatChineseDate(selectedArticle.date)}</p>
                                    <div dangerouslySetInnerHTML={{ __html: selectedArticle.body }} />
                                </div>
                            ) : (
                                <div className="placeholder">
                                    <p>请选择一篇文章查看详细内容。</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {activeTab === 'images' && (
                    <section className="images-section">
                        <div className={`images-list ${isSidebarOpen ? 'open' : ''}`}>
                            <h2>图片列表</h2>
                            <ul>
                                {images.map((image, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleImageClick(index)}
                                        className={`image-item ${currentImageIndex === index ? 'selected' : ''}`}
                                    >
                                        <span>{image}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="images-viewer">
                            {images.length > 0 && (
                                <>
                                    <div className="image-description">
                                        {descriptions[images[currentImageIndex]]}
                                    </div>
                                    <div className="image-container">
                                        <button className="nav-button prev" onClick={prevImage}>
                                            <span className="arrow">‹</span>
                                        </button>
                                        <img 
                                            src={`/img/${images[currentImageIndex]}`} 
                                            alt={descriptions[images[currentImageIndex]]}
                                            className="main-image"
                                        />
                                        <button className="nav-button next" onClick={nextImage}>
                                            <span className="arrow">›</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default App;
