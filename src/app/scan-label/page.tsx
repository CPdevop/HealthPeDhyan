'use client';

import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Scan, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { LabelAnalysisResults } from '@/components/label-scanner/analysis-results';

export default function ScanLabelPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleImageSelect(acceptedFiles[0]);
      }
    },
  });

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setAnalysisResult(null);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/label-scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setScanId(data.scanId);
      setIsUploading(false);
      setIsAnalyzing(true);

      // Poll for results
      pollForResults(data.scanId);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  };

  const pollForResults = async (id: string) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = setInterval(async () => {
      try {
        const response = await fetch(`/api/label-scan/${id}`);
        const data = await response.json();

        if (data.status === 'COMPLETED') {
          clearInterval(poll);
          setAnalysisResult(data.analysisResult);
          setIsAnalyzing(false);
        } else if (data.status === 'FAILED') {
          clearInterval(poll);
          setError('Analysis failed. The image may be unclear or not contain a product label.');
          setIsAnalyzing(false);
        }

        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setError('Analysis is taking longer than expected. Please try again.');
          setIsAnalyzing(false);
        }
      } catch (err) {
        clearInterval(poll);
        setError('Failed to get results. Please try again.');
        setIsAnalyzing(false);
      }
    }, 1000);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setScanId(null);
    setAnalysisResult(null);
    setError(null);
    setIsUploading(false);
    setIsAnalyzing(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-4">
          <Scan className="h-4 w-4" />
          AI-Powered Label Analysis
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">Scan Product Label</h1>
        <p className="mt-2 text-lg text-neutral-600">
          Upload or capture a photo of any product label to get instant health insights
        </p>
      </div>

      {!analysisResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Take a photo or upload an image of the product label
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dropzone */}
                {!previewUrl && (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                    <p className="text-neutral-700 font-medium mb-2">
                      {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
                    </p>
                    <p className="text-sm text-neutral-500">or click to browse</p>
                  </div>
                )}

                {/* Preview */}
                {previewUrl && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border-2 border-neutral-200">
                      <img
                        src={previewUrl}
                        alt="Selected label"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || isAnalyzing}
                        className="flex-1"
                      >
                        {isUploading || isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploading ? 'Uploading...' : 'Analyzing...'}
                          </>
                        ) : (
                          <>
                            <Scan className="mr-2 h-4 w-4" />
                            Analyze Label
                          </>
                        )}
                      </Button>
                      <Button onClick={handleReset} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Camera Button */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-neutral-500">or</span>
                  </div>
                </div>

                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                  disabled={isUploading || isAnalyzing}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleCameraCapture}
                />

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Processing */}
                {isAnalyzing && (
                  <div className="rounded-lg bg-blue-50 p-4 flex items-start gap-3">
                    <Loader2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        Analyzing label...
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        We're extracting ingredients and analyzing health impacts
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary-600" />
                  What We Analyze
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Ingredients</h4>
                  <p className="text-sm text-neutral-600">
                    We extract and analyze every ingredient, identifying harmful additives,
                    allergens, and beneficial components.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Nutrition Facts</h4>
                  <p className="text-sm text-neutral-600">
                    Sugar, sodium, fat, and calorie content are evaluated against health
                    guidelines.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Health Score</h4>
                  <p className="text-sm text-neutral-600">
                    Get an overall health score (0-100) based on ingredient quality and
                    nutritional value.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary-50 border-primary-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary-900 mb-1">Tips for Best Results</h4>
                    <ul className="text-sm text-primary-800 space-y-1">
                      <li>• Ensure good lighting</li>
                      <li>• Hold camera steady</li>
                      <li>• Capture the entire ingredients list</li>
                      <li>• Avoid glare and reflections</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <LabelAnalysisResults
          result={analysisResult}
          imageUrl={previewUrl}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
