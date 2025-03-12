// app.js - Main application file for Journal AI Wrapper

// ----------------- FRONTEND COMPONENTS -----------------

// Component for handling multiple image uploads
class JournalUploader {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      maxFiles: options.maxFiles || 20,
      allowedTypes: options.allowedTypes || ['image/jpeg', 'image/png', 'image/heic'],
      maxSizeMB: options.maxSizeMB || 10,
      ...options
    };
    
    this.uploadQueue = [];
    this.processedFiles = [];
    
    this.init();
  }
  
  init() {
    // Create upload area with drag-and-drop support
    this.createUploadArea();
    
    // Create preview area for uploaded images
    this.createPreviewArea();
    
    // Create process button
    this.createProcessButton();
  }
  
  createUploadArea() {
    const uploadArea = document.createElement('div');
    uploadArea.className = 'upload-area';
    uploadArea.innerHTML = `
      <div class="upload-prompt">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <h3>Drag journal pages here or click to upload</h3>
        <p>Upload up to ${this.options.maxFiles} images (${this.options.maxSizeMB}MB max each)</p>
      </div>
      <input type="file" multiple accept="${this.options.allowedTypes.join(',')}" class="file-input" />
    `;
    
    this.container.appendChild(uploadArea);
    
    // Add event listeners for drag and drop
    const fileInput = uploadArea.querySelector('.file-input');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });
  }
  
  createPreviewArea() {
    const previewArea = document.createElement('div');
    previewArea.className = 'preview-area';
    previewArea.innerHTML = `
      <h3>Uploaded Journal Pages</h3>
      <div class="preview-grid"></div>
    `;
    
    this.container.appendChild(previewArea);
    this.previewGrid = previewArea.querySelector('.preview-grid');
  }
  
  createProcessButton() {
    const processButton = document.createElement('button');
    processButton.className = 'process-button';
    processButton.textContent = 'Process Journal Pages';
    processButton.disabled = true;
    
    processButton.addEventListener('click', () => this.processUploads());
    
    this.container.appendChild(processButton);
    this.processButton = processButton;
  }
  
  handleFiles(fileList) {
    if (!fileList || !fileList.length) return;
    
    // Convert FileList to Array for easier manipulation
    const files = Array.from(fileList);
    
    // Validate files
    const validFiles = files.filter(file => {
      // Check file type
      if (!this.options.allowedTypes.includes(file.type)) {
        this.showError(`${file.name} is not a supported image type`);
        return false;
      }
      
      // Check file size
      if (file.size > this.options.maxSizeMB * 1024 * 1024) {
        this.showError(`${file.name} exceeds the maximum file size of ${this.options.maxSizeMB}MB`);
        return false;
      }
      
      return true;
    });
    
    // Check total file count
    if (this.uploadQueue.length + validFiles.length > this.options.maxFiles) {
      this.showError(`You can only upload up to ${this.options.maxFiles} files at once`);
      return;
    }
    
    // Add valid files to queue
    validFiles.forEach(file => {
      this.uploadQueue.push(file);
      this.createPreview(file);
    });
    
    // Enable process button if we have files
    this.processButton.disabled = this.uploadQueue.length === 0;
  }
  
  createPreview(file) {
    const reader = new FileReader();
    const preview = document.createElement('div');
    preview.className = 'preview-item';
    
    // Generate unique ID for this file
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    preview.dataset.fileId = fileId;
    file.id = fileId;
    
    preview.innerHTML = `
      <div class="preview-loading">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
      </div>
    `;
    
    this.previewGrid.appendChild(preview);
    
    reader.onload = (e) => {
      preview.innerHTML = `
        <div class="preview-image" style="background-image: url('${e.target.result}')"></div>
        <div class="preview-info">
          <span class="preview-name">${file.name}</span>
          <button class="preview-remove" data-file-id="${fileId}">✕</button>
        </div>
      `;
      
      // Add remove button functionality
      const removeButton = preview.querySelector('.preview-remove');
      removeButton.addEventListener('click', () => this.removeFile(fileId));
    };
    
    reader.readAsDataURL(file);
  }
  
  removeFile(fileId) {
    // Remove from upload queue
    this.uploadQueue = this.uploadQueue.filter(file => file.id !== fileId);
    
    // Remove preview
    const preview = this.previewGrid.querySelector(`.preview-item[data-file-id="${fileId}"]`);
    if (preview) preview.remove();
    
    // Disable process button if no files left
    this.processButton.disabled = this.uploadQueue.length === 0;
  }
  
  processUploads() {
    if (this.uploadQueue.length === 0) return;
    
    // Update UI to show processing state
    this.processButton.disabled = true;
    this.processButton.textContent = 'Processing...';
    
    // Create form data with all files
    const formData = new FormData();
    this.uploadQueue.forEach((file, index) => {
      formData.append(`journal_page_${index}`, file);
    });
    
    // Add metadata
    formData.append('page_count', this.uploadQueue.length);
    formData.append('timestamp', new Date().toISOString());
    
    // Send to backend
    this.uploadToBackend(formData);
  }
  
  uploadToBackend(formData) {
    // Here we would use the fetch API to send the files to your backend
    fetch('/api/journal/process', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      // Process successful response
      this.handleSuccessfulUpload(data);
    })
    .catch(error => {
      // Handle error
      this.showError('Upload failed: ' + error.message);
      
      // Reset button
      this.processButton.disabled = false;
      this.processButton.textContent = 'Process Journal Pages';
    });
  }
  
  handleSuccessfulUpload(data) {
    // Add processed files to history
    this.processedFiles = this.processedFiles.concat(this.uploadQueue);
    
    // Clear upload queue
    this.uploadQueue = [];
    
    // Clear preview area
    this.previewGrid.innerHTML = '';
    
    // Reset button
    this.processButton.disabled = true;
    this.processButton.textContent = 'Process Journal Pages';
    
    // Show success message
    this.showSuccess(`Successfully processed ${data.processed_pages} journal pages!`);
    
    // Trigger callback if provided
    if (this.options.onProcessComplete) {
      this.options.onProcessComplete(data);
    }
  }
  
  showError(message) {
    // Create toast notification for error
    this.showNotification(message, 'error');
  }
  
  showSuccess(message) {
    // Create toast notification for success
    this.showNotification(message, 'success');
  }
  
  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 5000);
  }
}

// ----------------- BACKEND API -----------------

/**
 * Backend API Endpoints (Express.js example)
 * 
 * The following would be implemented in your Node.js backend:
 */

/*
// Example backend code (Node.js with Express)
const express = require('express');
const multer = require('multer');
const { processJournalImages } = require('./ai-services');

const app = express();
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// API endpoint for processing journal pages
app.post('/api/journal/process', upload.array('journal_pages', 20), async (req, res) => {
  try {
    // Get uploaded files
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Process the files with OCR and AI analysis
    const result = await processJournalImages(files);
    
    // Return results
    return res.json({
      success: true,
      processed_pages: files.length,
      results: result
    });
  } catch (error) {
    console.error('Error processing journal pages:', error);
    return res.status(500).json({ error: 'Failed to process journal pages' });
  }
});
*/

// ----------------- AI PROCESSING MODULE -----------------

/**
 * This would be the core AI functionality that processes the images
 * It would handle OCR, text analysis, organization, etc.
 */

/*
// Example AI processing module (pseudo-code)
async function processJournalImages(imageFiles) {
  // 1. Extract text from images using OCR
  const extractedTexts = await Promise.all(
    imageFiles.map(file => performOCR(file.path))
  );
  
  // 2. Process and clean the extracted text
  const processedTexts = extractedTexts.map(text => cleanAndNormalizeText(text));
  
  // 3. Analyze the content for themes, topics, sentiment, etc.
  const analysisResults = await analyzeJournalContent(processedTexts);
  
  // 4. Organize the content based on the analysis
  const organizedContent = organizeContent(processedTexts, analysisResults);
  
  // 5. Generate insights and recommendations
  const insights = generateInsights(organizedContent, analysisResults);
  
  // 6. Return comprehensive results
  return {
    texts: processedTexts,
    analysis: analysisResults,
    organization: organizedContent,
    insights: insights
  };
}

// Perform OCR on an image
async function performOCR(imagePath) {
  // Use a library like Tesseract.js or call an OCR API
  // Example with Tesseract.js:
  // const { createWorker } = require('tesseract.js');
  // const worker = await createWorker();
  // await worker.loadLanguage('eng');
  // await worker.initialize('eng');
  // const { data } = await worker.recognize(imagePath);
  // await worker.terminate();
  // return data.text;
}

// Analyze journal content for themes, sentiment, etc.
async function analyzeJournalContent(texts) {
  // This would use NLP techniques or call AI APIs like OpenAI
  // Example:
  // - Sentiment analysis
  // - Topic extraction
  // - Named entity recognition
  // - Temporal analysis (dates, time references)
  // - Key phrase extraction
}

// Organize content based on analysis
function organizeContent(texts, analysis) {
  // Organize the journal entries by:
  // - Topics
  // - Chronology
  // - Sentiment
  // - Projects
  // - Goals
  // etc.
}

// Generate insights from the analysis
function generateInsights(organizedContent, analysis) {
  // Create meaningful insights like:
  // - Patterns over time
  // - Recurring themes
  // - Mood trends
  // - Connections between topics
  // - Progress on goals
  // etc.
}

// Clean and normalize extracted text
function cleanAndNormalizeText(text) {
  // Remove OCR artifacts
  // Correct common OCR errors
  // Normalize formatting
  // Split into paragraphs/sections
}
*/

// ----------------- USAGE EXAMPLE -----------------

// Example of how to initialize and use the uploader
document.addEventListener('DOMContentLoaded', () => {
  const journalUploader = new JournalUploader('journal-uploader-container', {
    maxFiles: 20,
    maxSizeMB: 10,
    onProcessComplete: (data) => {
      // Handle the processed data
      console.log('Processing complete:', data);
      
      // Update the UI with the results
      displayJournalAnalysis(data);
    }
  });
});

// Display the journal analysis results
function displayJournalAnalysis(data) {
  const resultsContainer = document.getElementById('journal-results-container');
  
  if (!resultsContainer) return;
  
  // Clear previous results
  resultsContainer.innerHTML = '';
  
  // Create tabs for different views
  const tabsHtml = `
    <div class="tabs">
      <button class="tab active" data-tab="transcription">Transcription</button>
      <button class="tab" data-tab="themes">Themes & Topics</button>
      <button class="tab" data-tab="insights">Insights</button>
      <button class="tab" data-tab="organization">Organization</button>
    </div>
    <div class="tab-content">
      <div class="tab-pane active" id="transcription"></div>
      <div class="tab-pane" id="themes"></div>
      <div class="tab-pane" id="insights"></div>
      <div class="tab-pane" id="organization"></div>
    </div>
  `;
  
  resultsContainer.innerHTML = tabsHtml;
  
  // Setup tab functionality
  const tabs = resultsContainer.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      tab.classList.add('active');
      
      // Hide all tab panes
      const tabPanes = resultsContainer.querySelectorAll('.tab-pane');
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // Show selected tab pane
      const targetPane = document.getElementById(tab.dataset.tab);
      if (targetPane) targetPane.classList.add('active');
    });
  });
  
  // Populate the tab content with the analysis data
  populateTranscriptionTab(data);
  populateThemesTab(data);
  populateInsightsTab(data);
  populateOrganizationTab(data);
}

// Helper functions to populate each tab
function populateTranscriptionTab(data) {
  const transcriptionTab = document.getElementById('transcription');
  if (!transcriptionTab || !data.results || !data.results.texts) return;
  
  let html = '<h2>Transcribed Journal Pages</h2>';
  
  data.results.texts.forEach((text, index) => {
    html += `
      <div class="transcription-item">
        <h3>Page ${index + 1}</h3>
        <div class="transcription-text">${text}</div>
      </div>
    `;
  });
  
  transcriptionTab.innerHTML = html;
}

function populateThemesTab(data) {
  // Similar implementation for themes tab
}

function populateInsightsTab(data) {
  // Similar implementation for insights tab
}

function populateOrganizationTab(data) {
  // Similar implementation for organization tab
}

// ----------------- CSS STYLES -----------------

/*
CSS styles would be in a separate file:

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  background-color: #f9f9f9;
}

.upload-area.drag-over {
  border-color: #007bff;
  background-color: #f0f7ff;
}

.upload-prompt h3 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #333;
}

.upload-prompt p {
  color: #666;
  margin-bottom: 0;
}

.file-input {
  display: none;
}

.preview-area {
  margin-bottom: 20px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.preview-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  background-color: white;
}

.preview-image {
  height: 150px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.preview-loading {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.preview-info {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
}

.preview-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.preview-remove {
  background: none;
  border: none;
  color: #ff3b30;
  cursor: pointer;
  font-size: 14px;
}

.process-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.process-button:hover {
  background-color: #0069d9;
}

.process-button:disabled {
  background-color: #b0cff0;
  cursor: not-allowed;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  z-index: 1000;
  animation: slide-in 0.3s ease;
}

.notification.success {
  background-color: #28a745;
}

.notification.error {
  background-color: #dc3545;
}

.notification.fade-out {
  animation: fade-out 0.5s ease forwards;
}

@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* Tab styles */
.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-right: 5px;
  cursor: pointer;
  font-weight: 500;
}

.tab.active {
  border-bottom-color: #007bff;
  color: #007bff;
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

.transcription-item {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.transcription-text {
  white-space: pre-wrap;
  line-height: 1.6;
}
*/