import React, { useState, useRef } from "react";
import "./Uploadfile.css";
import resumeAnalyzer from "../services/resumeAnalyzer";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setAnalysisResult(null);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    setAnalysisResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log("Starting resume analysis...");

      // Extract text from file
      const text = await resumeAnalyzer.extractTextFromFile(file);
      console.log("Text extracted successfully");

      // Analyze with TinyLlama
      const analysis = await resumeAnalyzer.analyzeResume(text);
      console.log("Analysis completed");

      setAnalysisResult(analysis);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>AI Resume Analyzer</h2>
        <p>Upload your resume for AI-powered analysis and ATS scoring</p>
      </div>

      <div
        className={`upload-area ${isDragOver ? "drag-over" : ""} ${file ? "has-file" : ""} ${isAnalyzing ? "uploading" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleChange}
          accept=".txt,.pdf"
          className="file-input"
        />

        {!file ? (
          <div className="upload-placeholder">
            <div className="upload-icon">📄</div>
            <p>Choose a resume file or drag it here</p>
            <span className="file-types">TXT and PDF files supported</span>
          </div>
        ) : (
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <p className="file-name">{file.name}</p>
              <p className="file-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              className="remove-file"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setAnalysisResult(null);
                setError(null);
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <button
        className={`upload-btn ${!file || isAnalyzing ? "disabled" : ""}`}
        onClick={handleSubmit}
        disabled={!file || isAnalyzing}
      >
        {isAnalyzing
          ? "Analyzing Resume..."
          : file
            ? "Analyze Resume"
            : "Select a file first"}
      </button>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {analysisResult && (
        <div className="analysis-results">
          <div className="score-section">
            <h3>ATS Score</h3>
            <div className="score-circle">
              <span className="score-number">
                {analysisResult.overallScore}
              </span>
              <span className="score-label">/100</span>
            </div>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{ width: `${analysisResult.overallScore}%` }}
              ></div>
            </div>
          </div>

          <div className="analysis-summary">
            <div className="summary-card">
              <h4>Resume Stats</h4>
              <div className="summary-row">
                <span>Word count</span>
                <strong>{analysisResult.wordCount || 0}</strong>
              </div>
              {analysisResult.formatting && (
                <>
                  <div className="summary-row">
                    <span>Bullet points</span>
                    <strong>{analysisResult.formatting.bullets}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Avg words / sentence</span>
                    <strong>
                      {analysisResult.formatting.averageWordsPerSentence}
                    </strong>
                  </div>
                </>
              )}
            </div>

            {analysisResult.sectionSummary && (
              <div className="summary-card">
                <h4>Sections Detected</h4>
                <div className="section-list">
                  {Object.entries(analysisResult.sectionSummary).map(
                    ([section, present]) => (
                      <span
                        key={section}
                        className={`section-chip ${present ? "present" : "missing"}`}
                      >
                        {section} {present ? "✓" : "✕"}
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="analysis-section">
            <h4>💪 Strengths</h4>
            <ul>
              {analysisResult.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h4>⚠️ Areas for Improvement</h4>
            <ul>
              {analysisResult.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h4>🎯 ATS Optimization Tips</h4>
            <ul>
              {analysisResult.atsOptimization.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="analysis-section">
            <h4>🔍 Recommended Keywords</h4>
            <div className="keywords">
              {analysisResult.keywordAnalysis.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
