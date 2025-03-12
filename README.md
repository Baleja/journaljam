# JournalJam

JournalJam is an AI-powered tool that helps you digitize, analyze, and organize your handwritten journal entries. Upload multiple journal pages at once and get intelligent insights about your thoughts, patterns, and habits.

## Features

- **Multiple Image Upload**: Easily upload multiple journal pages with drag-and-drop functionality
- **OCR Processing**: Convert your handwritten notes to digital text
- **AI Analysis**: Identify themes, topics, and sentiments in your journal entries
- **Organization**: Automatically categorize and tag your journal content
- **Insights**: Discover patterns and trends in your journaling practice
- **New Journal Planning**: Get recommendations for organizing your next notebook

## How It Works

1. **Upload**: Drag and drop your journal page images (JPEG, PNG, HEIC formats supported)
2. **Process**: Our AI analyzes your handwritten text and extracts the content
3. **Organize**: Your journal entries are categorized by topic, sentiment, and date
4. **Discover**: Gain insights into your journaling patterns and recurring themes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Baleja/journaljam.git
cd journaljam
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open `http://localhost:3000` in your browser

### Configuration

To configure OCR and AI settings, edit the `config.js` file:

```javascript
// Example configuration
module.exports = {
  ocr: {
    engine: 'tesseract', // Options: 'tesseract', 'google', 'azure'
    language: 'eng',
    timeout: 30000,
  },
  ai: {
    model: 'default', // Options: 'default', 'advanced'
    topicDetection: true,
    sentimentAnalysis: true,
    insightGeneration: true,
  }
};
```

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **OCR**: Tesseract.js (with options for Google Vision API or Azure Computer Vision)
- **AI Processing**: Natural language processing tools and services
- **Storage**: Local file system (with cloud storage options available)

## Future Enhancements

- Mobile app for direct journal page capture
- Cloud synchronization of journal entries
- Advanced search capabilities
- Export to various formats (PDF, DOCX, etc.)
- Collaborative journaling features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Project Link: [https://github.com/Baleja/journaljam](https://github.com/Baleja/journaljam)

---

*Made with ❤️ for journal enthusiasts everywhere*
