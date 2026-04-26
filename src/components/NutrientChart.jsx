import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const WARNING_TARGETS = ['energy', 'fat', 'carbohydrates', 'sugar'];

export const NUTRIENT_TARGETS = {
  energy: 700,
  protein: 25,
  fat: 20,
  carbohydrates: 100,
  sugar: 30,
  fiber: 7,
  vitamins: 33,
  minerals: 33
};

const NutrientChart = ({ nutrients }) => {
  // 標準的な1食あたりの目安値（正規化用）
  const targets = NUTRIENT_TARGETS;

  const labels = [
    'エネルギー',
    'タンパク質',
    '脂質',
    '炭水化物',
    '糖質',
    '食物繊維',
    'ビタミン',
    'ミネラル'
  ];

  const rawValues = [
    nutrients.energy.value,
    nutrients.protein.value,
    nutrients.fat.value,
    nutrients.carbohydrates.value,
    nutrients.sugar.value,
    nutrients.fiber.value,
    nutrients.vitamins.value,
    nutrients.minerals.value
  ];

  // 目安値に対する割合 (%) を計算（上限なしで実際のバランスの悪さを表現）
  const normalizedData = rawValues.map((val, i) => {
    const key = Object.keys(targets)[i];
    return (val / targets[key]) * 100;
  });

  // 危険箇所の点滅用ステート
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev);
    }, 600); // 600ms間隔で点滅
    return () => clearInterval(interval);
  }, []);

  const pointColors = normalizedData.map((val, i) => {
    const key = Object.keys(targets)[i];
    const isWarningTarget = WARNING_TARGETS.includes(key);
    
    if (isWarningTarget && val > 100) {
      return blink ? '#ef4444' : '#fee2e2'; // 赤と薄い赤で点滅
    }
    return 'rgba(16, 185, 129, 1)'; // 正常値はグリーン
  });

  const pointRadii = normalizedData.map((val, i) => {
    const key = Object.keys(targets)[i];
    const isWarningTarget = WARNING_TARGETS.includes(key);
    return (isWarningTarget && val > 100 && blink) ? 8 : 4; // 点滅時に少し大きくする
  });

  const data = {
    labels,
    datasets: [
      {
        label: '栄養充足率 (%)',
        data: normalizedData,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: pointColors,
        pointRadius: pointRadii,
        pointHoverRadius: 8,
      },
      {
        label: '理想のバランス (100%)',
        data: [100, 100, 100, 100, 100, 100, 100, 100],
        backgroundColor: 'transparent',
        borderColor: 'rgba(59, 130, 246, 0.6)', // 青色の点線
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="chart-container">
      <Radar data={data} options={options} />
    </div>
  );
};

export default NutrientChart;
