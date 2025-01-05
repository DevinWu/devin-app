import React, { useState, useEffect } from 'react';
import './App.css';
import { getDiaries } from './api/getDiaries';
import { marked } from 'marked';

function App() {
    const [articles, setArticles] = useState([]);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeTab, setActiveTab] = useState('logs');

    useEffect(() => {
        // Fetch articles
        getDiaries().then(data => {
            setArticles(data);
            // Set the most recent article as selected
            if (data.length > 0) {
                // Sort articles by date (assuming dates are in "#### YYYY年MM月DD日" format)
                const sortedArticles = [...data].sort((a, b) => {
                    // Convert dates to string if they aren't already
                    const dateStrA = String(a.date || '');
                    const dateStrB = String(b.date || '');
                    
                    // Skip the "#### " prefix if it exists
                    const dateA = dateStrA.startsWith('#### ') ? dateStrA.substring(5) : dateStrA;
                    const dateB = dateStrB.startsWith('#### ') ? dateStrB.substring(5) : dateStrB;
                    
                    try {
                        // Convert "YYYY年MM月DD日" to Date object for comparison
                        const [yearA, monthA, dayA] = dateA.match(/(\d+)年(\d+)月(\d+)日/).slice(1);
                        const [yearB, monthB, dayB] = dateB.match(/(\d+)年(\d+)月(\d+)日/).slice(1);
                        return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
                    } catch (error) {
                        console.error('日期解析错误:', error);
                        return 0; // 如果解析失败，保持原有顺序
                    }
                });
                setSelectedArticle(sortedArticles[0]);
            }
        });

        // Fetch images
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('/img/imageList.json');
            if (!response.ok) {
                throw new Error('无法加载 imageList.json');
            }
            const imageList = await response.json();
            setImages(imageList);
        } catch (error) {
            console.error('获取图片列表失败:', error);
        }
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
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSelectedArticle(null);
    };

    const formatChineseDate = (dateStr) => {
        // If it's a Date object, convert to string
        if (dateStr instanceof Date) {
            return dateStr.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            }).replace(/\//g, '年') + '日';
        }
        
        // If it's a string starting with ####
        if (typeof dateStr === 'string' && dateStr.startsWith('#### ')) {
            return dateStr.substring(5);
        }
        
        // If it's any other type, convert to string
        return String(dateStr || '');
    };

    return (
        <div className="App">
            <header className="header">
                <h1>Devin Wu's Personal Blog</h1>
                <div className="tabs">
                    <button
                        className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                        onClick={() => handleTabClick('logs')}
                    >
                        日志
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
                        onClick={() => handleTabClick('images')}
                    >
                        图片
                    </button>
                </div>
            </header>
            <div className="main-content">
                {activeTab === 'logs' && (
                    <section className="logs-section">
                        <div className="logs-list">
                            <h2>日志列表</h2>
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
                                    <p>请选择一篇日志查看详细内容。</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {activeTab === 'images' && (
                    <section className="images-section">
                        <div className="images-list">
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
                                    <button className="nav-button left" onClick={prevImage}>&#10094;</button>
                                    <img src={`/img/${images[currentImageIndex]}`} alt={`Image ${currentImageIndex + 1}`} />
                                    <button className="nav-button right" onClick={nextImage}>&#10095;</button>
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
