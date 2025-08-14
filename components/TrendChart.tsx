import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SimpleTrendChartProps {
    trendData: Array<{
        assessment: string;
        date: string;
        emotional: number;
        conduct: number;
        hyperactivity: number;
        peer: number;
        totalDifficulties: number;
        prosocial: number;
    }>;
}

const SimpleTrendChart: React.FC<SimpleTrendChartProps> = ({ trendData }) => {
    const [selectedMetric, setSelectedMetric] = useState('totalDifficulties');

    const metrics = {
        totalDifficulties: {
            name: 'คะแนนรวมปัญหา',
            color: '#8B5CF6',
            normalRange: 15,
            riskRange: 17,
            description: 'คะแนนรวมของปัญหาทั้ง 4 ด้าน'
        },
        emotional: {
            name: 'ปัญหาทางอารมณ์',
            color: '#EF4444',
            normalRange: 3,
            riskRange: 4,
            description: 'ความกังวล ความเศร้า ความกลัว'
        },
        conduct: {
            name: 'ปัญหาความประพฤติ',
            color: '#F97316',
            normalRange: 3,
            riskRange: 4,
            description: 'การทำตัวไม่เหมาะสม การไม่เชื่อฟัง'
        },
        hyperactivity: {
            name: 'ไม่อยู่นิ่ง/ไม่ตั้งใจ',
            color: '#06B6D4',
            normalRange: 5,
            riskRange: 6,
            description: 'ไม่สามารถนั่งนิ่ง สมาธิสั้น'
        },
        peer: {
            name: 'ปัญหาเพื่อน',
            color: '#10B981',
            normalRange: 5,
            riskRange: 6,
            description: 'ความสัมพันธ์กับเพื่อน การเข้าสังคม'
        }
    };

    const currentMetric = metrics[selectedMetric as keyof typeof metrics];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800">{`${data.assessment} (${data.date})`}</p>
                    <p className="text-sm text-gray-600 mb-2">{currentMetric.description}</p>
                    <p className="font-bold" style={{ color: currentMetric.color }}>
                        {`${currentMetric.name}: ${payload[0].value} คะแนน`}
                    </p>
                    <div className="mt-2 text-xs">
                        <p className="text-green-600">✓ ปกติ: 0-{currentMetric.normalRange}</p>
                        <p className="text-yellow-600">⚠ เสี่ยง: {currentMetric.normalRange + 1}-{currentMetric.riskRange}</p>
                        <p className="text-red-600">⚠ มีปัญหา: {currentMetric.riskRange + 1}+</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    const getInterpretation = (score: number) => {
        if (score <= currentMetric.normalRange) return 'ปกติ';
        if (score <= currentMetric.riskRange) return 'เสี่ยง';
        return 'มีปัญหา';
    };

    const getInterpretationColor = (interpretation: string) => {
        switch (interpretation) {
            case 'ปกติ': return 'text-green-600 bg-green-50';
            case 'เสี่ยง': return 'text-yellow-600 bg-yellow-50';
            case 'มีปัญหา': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (!trendData || trendData.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">แนวโน้มคะแนน</h2>
                <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลแนวโน้มเพียงพอ (ต้องมีการประเมินอย่างน้อย 2 ครั้ง)</p>
            </div>
        );
    }

    if (trendData.length < 2) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">แนวโน้มคะแนน</h2>
                <p className="text-gray-500 text-center py-8">ต้องมีการประเมินอย่างน้อย 2 ครั้งเพื่อแสดงแนวโน้ม</p>
            </div>
        );
    }

    const latestScore = trendData[trendData.length - 1][selectedMetric as keyof typeof trendData[0]];
    const latestInterpretation = getInterpretation(latestScore);
    const improvement = trendData[0][selectedMetric as keyof typeof trendData[0]] - latestScore;

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">แนวโน้มคะแนน</h2>

            {/* เลือกตัวชี้วัด */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">เลือกตัวชี้วัดที่ต้องการดู:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(metrics).map(([key, metric]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedMetric(key)}
                            className={`p-3 rounded-lg border-2 transition-all ${selectedMetric === key
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-sm font-medium">{metric.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* สรุปผลล่าสุด */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">คะแนนล่าสุด</div>
                    <div className="text-3xl font-bold text-gray-800">{latestScore}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getInterpretationColor(latestInterpretation)}`}>
                        {latestInterpretation}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">การเปลี่ยนแปลง</div>
                    <div className={`text-3xl font-bold ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {improvement > 0 ? '-' : improvement < 0 ? '+' : ''}{Math.abs(improvement)}
                    </div>
                    <div className="text-xs text-gray-500">
                        {improvement > 0 ? 'ดีขึ้น' : improvement < 0 ? 'แย่ลง' : 'คงที่'}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">จำนวนครั้งที่ประเมิน</div>
                    <div className="text-3xl font-bold text-gray-800">{trendData.length}</div>
                    <div className="text-xs text-gray-500">ครั้ง</div>
                </div>
            </div>

            {/* กราฟแนวโน้ม */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    แนวโน้ม: {currentMetric.name}
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="assessment"
                                stroke="#666"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="#666"
                                fontSize={12}
                                domain={[0, 'dataMax + 2']}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* เส้นแบ่งระดับความเสี่ยง */}
                            <ReferenceLine
                                y={currentMetric.normalRange}
                                stroke="#10B981"
                                strokeDasharray="5 5"
                                label={{ value: "เขตปกติ", position: "insideTopRight" }}
                            />
                            <ReferenceLine
                                y={currentMetric.riskRange}
                                stroke="#F59E0B"
                                strokeDasharray="5 5"
                                label={{ value: "เขตเสี่ยง", position: "insideTopRight" }}
                            />

                            <Line
                                type="monotone"
                                dataKey={selectedMetric}
                                stroke={currentMetric.color}
                                strokeWidth={3}
                                dot={{ r: 6, fill: currentMetric.color }}
                                activeDot={{ r: 8, fill: currentMetric.color }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* คำอธิบายกราฟ */}
                <div className="mt-6 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        การตีความกราฟ
                    </h4>

                    {/* เขตความเสี่ยง */}
                    <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">เขตความเสี่ยง</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm">
                                <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
                                <div>
                                    <span className="font-medium text-green-700">เขตปกติ</span>
                                    <div className="text-sm text-gray-600">คะแนน 0-{currentMetric.normalRange}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-100 shadow-sm">
                                <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                                <div>
                                    <span className="font-medium text-yellow-700">เขตเสี่ยง</span>
                                    <div className="text-sm text-gray-600">คะแนน {currentMetric.normalRange + 1}-{currentMetric.riskRange}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                                <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                                <div>
                                    <span className="font-medium text-red-700">มีปัญหา</span>
                                    <div className="text-sm text-gray-600">คะแนน {currentMetric.riskRange + 1} ขึ้นไป</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* การอ่านแนวโน้ม */}
                    <div className="border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">การอ่านแนวโน้ม</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                <div className="p-1.5 bg-green-100 rounded-full">
                                    <TrendingDown className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-green-600">เส้นกราฟลง</div>
                                    <div className="text-sm text-gray-600">คะแนนดีขึ้น (ปัญหาลดลง)</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                <div className="p-1.5 bg-red-100 rounded-full">
                                    <TrendingUp className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-red-600">เส้นกราฟขึ้น</div>
                                    <div className="text-sm text-gray-600">คะแนนแย่ลง (ปัญหาเพิ่ม)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleTrendChart;