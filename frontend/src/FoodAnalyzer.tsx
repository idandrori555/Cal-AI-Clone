import React, { useState } from 'react';
import { Camera, Upload, Zap, Apple, TrendingUp, Info } from 'lucide-react';

const FoodAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [macros, setMacros] = useState<{ calories: string, protein: string, carbs: string, fat: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      processFile(files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setMacros(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://10.56.144.89:3000/api/macros', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setAnalysisResult(result);
      setMacros(JSON.parse(result?.data));
    } catch (e: any) {
      setError(`Failed to analyze image: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  const MacroCard = ({ label, value, unit, color, icon: Icon }: any) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xs text-gray-500">{unit}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg">
            <Apple className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            AI Food Analyzer
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Instantly analyze your food photos to get detailed nutritional information and macro breakdowns
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
            <div className="p-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isDragOver
                  ? 'border-emerald-400 bg-emerald-50'
                  : imagePreview
                    ? 'border-emerald-200 bg-emerald-25'
                    : 'border-gray-300 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-25'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="max-h-64 mx-auto rounded-lg shadow-md object-cover"
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={clearImage}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <Upload className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-1">
                        Drop your food photo here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to browse from your device
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium cursor-pointer hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Camera className="w-5 h-5" />
                        Choose Photo
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Analyze Button */}
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing Food...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyze Nutrition
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <Info className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                <div className="flex items-center gap-3 text-white">
                  <TrendingUp className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Nutritional Analysis</h2>
                </div>
              </div>

              <div className="p-6">
                {/* Sample macro display - you'll want to adapt this to your actual API response */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <MacroCard
                    label="Calories"
                    value={macros?.calories || "N/A"}
                    unit="kcal"
                    color="bg-orange-500"
                    icon={Zap}
                  />
                  <MacroCard
                    label="Protein"
                    value={macros?.protein || "N/A"}
                    unit="grams"
                    color="bg-red-500"
                    icon={TrendingUp}
                  />
                  <MacroCard
                    label="Carbs"
                    value={macros?.carbs || "N/A"}
                    unit="grams"
                    color="bg-blue-500"
                    icon={Apple}
                  />
                  <MacroCard
                    label="Fat"
                    value={macros?.fat || "N/A"}
                    unit="grams"
                    color="bg-yellow-500"
                    icon={Info}
                  />
                </div>

                {/* Raw Data (for debugging) */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Detailed Analysis
                  </h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-32">
                    {JSON.stringify(macros, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">Powered by AI • Analyze any food photo instantly</p>
        </div>
      </div>
    </div>
  );
};

export default FoodAnalyzer;
