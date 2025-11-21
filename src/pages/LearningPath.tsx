import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Unit } from '../types/types';

const LearningPath = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [hoveredInfo, setHoveredInfo] = useState<{ unit: Unit, top: number } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUnits = async () => {
            try {
                const baseUrl = import.meta.env.BASE_URL;
                const response = await fetch(`${baseUrl}data.json`);
                if (!response.ok) throw new Error('Failed to load data');
                const data = await response.json();
                setUnits(data);
                if (data.length > 0) setSelectedUnit(data[0]);
            } catch (error) {
                console.error('Error loading units:', error);
            }
        };
        loadUnits();
    }, []);

    const handleUnitClick = (unit: Unit) => {
        setSelectedUnit(unit);
    };

    const handleStartClick = () => {
        if (selectedUnit) {
            navigate(`/flashcards/${selectedUnit.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex overflow-hidden font-sans">

            {/* Left Sidebar - Timeline */}
            <div className="w-24 h-screen flex flex-col border-r border-slate-800 bg-[#0F172A]/50 backdrop-blur-sm z-20 relative shrink-0">
                {/* Header / Back Button */}
                <div className="p-4 flex flex-col items-center gap-4 border-b border-slate-800/50 shrink-0">
                    <Link to="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                </div>

                {/* Scrollable List - Scrollbar Hidden */}
                <div className="flex-1 overflow-y-auto py-8 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] flex flex-col items-center">
                    {units.map((unit) => {
                        const isSelected = selectedUnit?.id === unit.id;

                        return (
                            <div
                                key={unit.id}
                                className="relative flex items-center justify-center group cursor-pointer w-full"
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredInfo({ unit, top: rect.top + rect.height / 2 });
                                }}
                                onMouseLeave={() => setHoveredInfo(null)}
                                onClick={() => handleUnitClick(unit)}
                            >
                                {/* The Line Indicator */}
                                <div className="w-full flex justify-center py-1">
                                    <motion.div
                                        layoutId="active-indicator"
                                        className={`rounded-full transition-all duration-300 
                       ${isSelected
                                                ? 'w-3 h-16 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
                                                : 'w-2 h-10 bg-slate-700 group-hover:bg-slate-500 group-hover:h-12 group-hover:w-6'
                                            }
                     `}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Tooltip (Outside Overflow Container) */}
            <AnimatePresence>
                {hoveredInfo && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.8 }}
                        animate={{ opacity: 1, x: 30, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="fixed z-50 pointer-events-none origin-left"
                        style={{ top: hoveredInfo.top, left: '3rem', transform: 'translateY(-50%)' }}
                    >
                        <div className="px-4 py-2 rounded-r-xl rounded-bl-xl backdrop-blur-xl border border-slate-700/50 shadow-2xl bg-slate-900/90 text-slate-200 whitespace-nowrap flex items-center">
                            {/* Small arrow pointing to the line */}
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900/90 border-l border-b border-slate-700/50 rotate-45 transform"></div>
                            <span className="text-base font-bold tracking-wide relative z-10">{hoveredInfo.unit.title}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area (Right Side) */}
            <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>

                <AnimatePresence mode="wait">
                    {selectedUnit ? (
                        <motion.div
                            key={selectedUnit.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="text-center max-w-2xl px-8 relative z-10"
                        >
                            <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase">
                                Unit {selectedUnit.id}
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
                                {selectedUnit.title}
                            </h2>

                            <p className="text-slate-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                                Bu ünitede öğreneceğiniz kelimelerle dil becerilerinizi geliştirin. Hazır olduğunuzda başlayın!
                            </p>

                            <button
                                onClick={handleStartClick}
                                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-2xl hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
                            >
                                <span>Üniteye Başla</span>
                                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ) : (
                        <div className="text-slate-500">Lütfen bir ünite seçin</div>
                    )}
                </AnimatePresence>
            </div>

        </div>
    );
};

export default LearningPath;
