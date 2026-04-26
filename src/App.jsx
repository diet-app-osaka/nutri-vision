import React, { useState } from 'react';
import { Camera, Upload, RefreshCw, ChefHat, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeMealImage } from './services/GeminiService';
import NutrientChart, { NUTRIENT_TARGETS, WARNING_TARGETS } from './components/NutrientChart';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [dragging, setDragging] = useState(false);

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        callback(compressedDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      compressImage(file, (compressedDataUrl) => {
        setPreview(compressedDataUrl);
        setImage(compressedDataUrl);
        setResult(null);
        setError(null);
      });
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageChange({ target: { files: e.dataTransfer.files } });
      e.dataTransfer.clearData();
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMealImage(image);
      setResult(data);
    } catch (err) {
      setError('解析に失敗しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const checkExcess = (key, value) => {
    if (!result) return false;
    if (!WARNING_TARGETS.includes(key)) return false;
    return (value / NUTRIENT_TARGETS[key]) * 100 > 100;
  };

  return (
    <div className="container">
      <header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          NutriVision
        </motion.h1>
        <p className="subtitle">AIがあなたの食事を栄養素から見える化します</p>
      </header>

      <main>
        {!result && !loading && (
          <motion.div 
            className="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <label 
              className={`upload-area ${dragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                </div>
              ) : (
                <>
                  <Camera />
                  <p>写真をアップロードするか、カメラで撮影してください</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ドラッグ＆ドロップにも対応しています
                  </span>
                </>
              )}
            </label>

            {preview && (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={handleAnalyze}>
                  <ChefHat size={20} />
                  解析を開始する
                </button>
                <button 
                  className="btn" 
                  onClick={reset}
                  style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}
                >
                  やり直す
                </button>
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div 
              className="card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}
            >
              <div className="loading-spinner"></div>
              <p>AIが栄養素を解析中です...</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                盛り付けや食材をチェックしています
              </p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {result.mealName}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600' }}>
                  <Info size={16} />
                  <span>推定栄養スコア</span>
                </div>
              </div>

              <NutrientChart nutrients={result.nutrients} />

              <div className="result-grid">
                <div className={`nutrient-stat ${checkExcess('energy', result.nutrients.energy.value) ? 'excess' : ''}`}>
                  <label>エネルギー {checkExcess('energy', result.nutrients.energy.value) && <span className="excess-label">(過剰)</span>}</label>
                  <div className="value">{result.nutrients.energy.value} kcal</div>
                </div>
                <div className={`nutrient-stat ${checkExcess('protein', result.nutrients.protein.value) ? 'excess' : ''}`}>
                  <label>タンパク質 {checkExcess('protein', result.nutrients.protein.value) && <span className="excess-label">(過剰)</span>}</label>
                  <div className="value">{result.nutrients.protein.value} g</div>
                </div>
                <div className={`nutrient-stat ${checkExcess('fat', result.nutrients.fat.value) ? 'excess' : ''}`}>
                  <label>脂質 {checkExcess('fat', result.nutrients.fat.value) && <span className="excess-label">(過剰)</span>}</label>
                  <div className="value">{result.nutrients.fat.value} g</div>
                </div>
                <div className={`nutrient-stat ${checkExcess('carbohydrates', result.nutrients.carbohydrates.value) ? 'excess' : ''}`}>
                  <label>炭水化物 {checkExcess('carbohydrates', result.nutrients.carbohydrates.value) && <span className="excess-label">(過剰)</span>}</label>
                  <div className="value">{result.nutrients.carbohydrates.value} g</div>
                </div>
                <div className={`nutrient-stat ${checkExcess('sugar', result.nutrients.sugar.value) ? 'excess' : ''}`}>
                  <label>糖質 {checkExcess('sugar', result.nutrients.sugar.value) && <span className="excess-label">(過剰)</span>}</label>
                  <div className="value">{result.nutrients.sugar.value} g</div>
                </div>
                <div className="nutrient-stat">
                  <label>食物繊維</label>
                  <div className="value">{result.nutrients.fiber.value} g</div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--primary-light)', borderRadius: '0.75rem', fontSize: '0.95rem' }}>
                <p style={{ lineHeight: '1.8' }}>
                  <strong>辛口AIコメント:</strong><br />
                  {result.description.split(/<br\s*\/?>|\n/).map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={reset}>
                  <RefreshCw size={18} />
                  別の写真を解析する
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div style={{ color: '#ef4444', textAlign: 'center', padding: '1rem' }}>
            {error}
          </div>
        )}
      </main>

      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        &copy; 2026 NutriVision AI. 栄養素はAIによる推定値であり、正確な数値を保証するものではありません。
      </footer>
    </div>
  );
}

export default App;
