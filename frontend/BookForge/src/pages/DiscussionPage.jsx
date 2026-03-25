import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Send, User, MessageSquare, ArrowLeft, Zap, Flame, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { mangaData } from '../data/mangaData';

const DiscussionPage = () => {
    const { type, id } = useParams(); // type: 'manga' or 'book', id: targetId
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [targetInfo, setTargetInfo] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        fetchTargetInfo();
        const interval = setInterval(fetchMessages, 5000); // Polling for "live" feel
        return () => clearInterval(interval);
    }, [id, type]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const { data } = await axiosInstance.get(`/api/social/discuss/${id}`);
            setMessages(data.data.reverse()); // Newest at bottom
        } catch (error) {
            console.error("Failed to fetch discussions", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTargetInfo = async () => {
        if (type === 'manga' || type === 'series') {
            const manga = mangaData.find(m => m.id === parseInt(id));
            if (manga) {
                setTargetInfo({
                    title: manga.title,
                    cover: manga.cover,
                    subtitle: `BY ${manga.author}`,
                    accent: '#FF6600'
                });
            }
        } else {
            try {
                const { data } = await axiosInstance.get(`/api/books/${id}`);
                setTargetInfo({
                    title: data.data.title,
                    cover: data.data.coverImage,
                    subtitle: `BY ${data.data.author}`,
                    accent: '#00AEEF'
                });
            } catch (error) {
                console.error("Failed to fetch book details", error);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        const mappedType = type === 'series' || type === 'manga' ? 'manga' : 'book';
        try {
            const { data } = await axiosInstance.post(
                `/api/social/discuss`,
                { targetId: id, targetType: mappedType, content }
            );

            setMessages([...messages, data.data]);
            setContent('');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFBEB] pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-black text-white p-6 border-b-8 border-r-8 transform -skew-x-1" 
                     style={{ borderColor: targetInfo?.accent || '#FF6600' }}>
                    <div className="flex items-center gap-6 transform skew-x-1">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 transition-colors rounded-full border border-white/20">
                            <ArrowLeft size={24} />
                        </button>
                        
                        <div className="flex items-center gap-4">
                            {targetInfo?.cover && (
                                <div className="w-16 h-20 border-2 border-white shadow-[4px_4px_0_rgba(255,255,255,0.2)] overflow-hidden hidden sm:block">
                                    <img src={targetInfo.cover} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                                    {targetInfo ? targetInfo.title : (type === 'manga' ? 'Manga Forum' : 'Book Chat')}
                                </h1>
                                <p className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase">
                                    {targetInfo ? targetInfo.subtitle : `Discussion ID: ${id}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1 transform skew-x-1">
                        <div className="flex items-center gap-2">
                             <MessageSquare className="text-[#00AEEF]" fill="currentColor" size={18} />
                             <span className="text-sm font-black italic">{messages.length} TRANSMISSIONS</span>
                        </div>
                        <span className="text-[8px] font-bold tracking-[0.2em] text-white/50 uppercase">ENCRYPTED CHANNEL {id}</span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="bg-white border-4 border-black shadow-[12px_12px_0_rgba(0,0,0,1)] flex flex-col h-[600px] relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Zap size={200} />
                    </div>

                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                                <Flame size={48} className="mb-4" />
                                <p className="font-bold">The frequency is silent. Be the first to transmit!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div key={msg._id} className={`flex flex-col ${msg.user?._id === 'my-id' ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {msg.user?.avatar ? (
                                            <img src={msg.user.avatar} className="w-5 h-5 rounded-full border border-black" alt="" />
                                        ) : (
                                            <User size={12} className="text-muted-foreground" />
                                        )}
                                        <span className="text-[10px] font-black uppercase">{msg.user?.name || 'Anonymous'}</span>
                                        <span className="text-[8px] font-bold text-muted-foreground">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="max-w-[80%] bg-white border-2 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,1)] relative">
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-6 bg-gray-50 border-t-4 border-black flex gap-4">
                        <input 
                            type="text" 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-white border-2 border-black p-3 text-sm font-bold focus:outline-none focus:ring-4 ring-[#00AEEF]/20"
                        />
                        <button 
                            type="submit"
                            className="bg-[#FF6600] text-white p-3 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            <Send size={24} />
                        </button>
                    </form>
                </div>

                {/* Footer Tip */}
                <div className="mt-8 flex items-center gap-4 bg-[#FFD700] border-2 border-black p-4 italic font-bold text-xs transform rotate-1">
                    <Zap size={16} fill="currentColor" />
                    Tip: Be respectful of other fans. Spoilers should be marked or discussed with caution!
                </div>
            </div>
        </div>
    );
};

export default DiscussionPage;
