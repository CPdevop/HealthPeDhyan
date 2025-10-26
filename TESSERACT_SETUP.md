# Tesseract OCR Setup for Windows

The label scanner feature requires Tesseract OCR to be installed on your system.

## Windows Installation

### Option 1: Using Chocolatey (Recommended)

If you have Chocolatey installed:

```bash
choco install tesseract
```

### Option 2: Manual Installation

1. Download the Tesseract installer from:
   https://github.com/UB-Mannheim/tesseract/wiki

2. Download the latest version (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)

3. Run the installer

4. **IMPORTANT**: During installation, make sure to:
   - Check "Add to PATH" option
   - Install at least the English language data

5. After installation, restart your terminal/PowerShell

## Verify Installation

Open a new terminal and run:

```bash
tesseract --version
```

You should see output like:
```
tesseract 5.3.3
 leptonica-1.84.1
  libgif 5.2.1 : libjpeg 8d (libjpeg-turbo 3.0.1) : libpng 1.6.43 : libtiff 4.6.0 : zlib 1.3.1 : libwebp 1.3.2 : libopenjp2 2.5.0
```

## Troubleshooting

### "tesseract is not recognized as an internal or external command"

1. Find where Tesseract was installed (usually `C:\Program Files\Tesseract-OCR`)
2. Add it to your PATH:
   - Search for "Environment Variables" in Windows
   - Edit "System variables" → "Path"
   - Add: `C:\Program Files\Tesseract-OCR`
   - Restart your terminal

### "Error opening data file"

The English language data is missing. Reinstall Tesseract and make sure to select English language pack during installation.

## Mac Installation

```bash
brew install tesseract
```

## Linux Installation

```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```
