import React, { useState, useEffect, useRef } from "react";
import { X, Activity, Heart, Thermometer, Wind } from "lucide-react";

const ECGGraphModal = ({ isOpen, onClose, patientName, sensorData }) => {
    const [dataPoints, setDataPoints] = useState([]);
    const requestRef = useRef();

    useEffect(() => {
        if (!isOpen) return;

        // Initialize with some data
        const initialPoints = [];
        for (let i = 0; i < 100; i++) {
            initialPoints.push(50);
        }
        setDataPoints(initialPoints);

        let tick = 0;
        const updateGraph = () => {
            setDataPoints((prev) => {
                const newPoints = [...prev.slice(1)];

                // Determine pattern from sensorData or use simulation
                let pattern = [];

                if (sensorData?.ecg) {
                    // Attempt to parse real data
                    if (Array.isArray(sensorData.ecg)) {
                        pattern = sensorData.ecg;
                    } else if (typeof sensorData.ecg === 'string' && sensorData.ecg.includes(',')) {
                        pattern = sensorData.ecg.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
                    }
                }

                // Fallback to simulation if no valid data
                if (pattern.length < 5) {
                    pattern = [50, 50];
                }

                const index = tick % pattern.length;
                // Removed noise for clean line
                newPoints.push(pattern[index]);

                tick++;
                return newPoints;
            });
            requestRef.current = setTimeout(updateGraph, 40); // Slightly faster
        };

        updateGraph();

        return () => {
            if (requestRef.current) clearTimeout(requestRef.current);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const pathData = dataPoints.map((y, index) => {
        const x = (index / (dataPoints.length - 1)) * 100;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(" ");

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl m-4 overflow-hidden border border-gray-700 flex flex-col md:flex-row">

                {/* Main Graph Area */}
                <div className="flex-1 p-6 relative">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#F26522] flex items-center gap-2">
                                <Activity className="animate-pulse" /> Live ECG Monitor
                            </h2>
                            <p className="text-gray-400 mt-1">Patient: <span className="text-white font-semibold text-lg">{patientName || "Unknown"}</span></p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    <div className="w-full h-80 md:h-[500px] bg-black rounded-lg overflow-hidden border border-gray-800 relative shadow-inner">
                        {/* Grid */}
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'linear-gradient(#0f0 1px, transparent 1px), linear-gradient(90deg, #0f0 1px, transparent 1px)',
                                backgroundSize: '20px 20px'
                            }}>
                        </div>
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'linear-gradient(#0f0 1px, transparent 1px), linear-gradient(90deg, #0f0 1px, transparent 1px)',
                                backgroundSize: '100px 100px'
                            }}>
                        </div>

                        <svg
                            className="w-full h-full relative z-10"
                            preserveAspectRatio="none"
                            viewBox="0 0 100 100"
                        >
                            <path
                                d={pathData}
                                fill="none"
                                stroke="#00ff00"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                style={{ filter: "drop-shadow(0 0 4px #00ff00)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent w-24 z-20 pointer-events-none"></div>
                    </div>
                </div>

                {/* Side Panel - Vitals */}
                <div className="bg-gray-800 w-full md:w-80 p-6 border-l border-gray-700 flex flex-col gap-6 ">
                    <h3 className="text-gray-400 font-semibold uppercase tracking-wider text-sm border-b border-gray-700 pb-2">Real-time Vitals</h3>

                    {/* Heart Rate */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-red-500 mb-1">
                            <Heart size={20} className="animate-pulse" fill="currentColor" />
                            <span className="text-sm font-medium">Heart Rate</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-mono font-bold text-white leading-none">
                                {sensorData?.bloodPressure || "--"}
                            </span>
                            <span className="text-gray-500 text-sm mb-1">bpm</span>
                        </div>
                    </div>

                    {/* Oxygen */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                            <Activity size={20} />
                            <span className="text-sm font-medium">SpO2</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-mono font-bold text-white leading-none">
                                {sensorData?.oxygenSaturation || "--"}
                            </span>
                            <span className="text-gray-500 text-sm mb-1">%</span>
                        </div>
                    </div>

                    {/* Respiration */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-green-400 mb-1">
                            <Wind size={20} />
                            <span className="text-sm font-medium">Respiration</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-mono font-bold text-white leading-none">
                                {sensorData?.respirationRate || "--"}
                            </span>
                            <span className="text-gray-500 text-sm mb-1">rpm</span>
                        </div>
                    </div>

                    {/* Temp */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center gap-2 text-yellow-500 mb-1">
                            <Thermometer size={20} />
                            <span className="text-sm font-medium">Temp</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-mono font-bold text-white leading-none">
                                {sensorData?.temperature || "--"}
                            </span>
                            <span className="text-gray-500 text-sm mb-1">°C</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6">
                        <button onClick={onClose} className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                            Close Monitor
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ECGGraphModal;
