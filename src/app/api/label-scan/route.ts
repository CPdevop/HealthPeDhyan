import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTextFromImage, parseLabelText } from '@/lib/ocr';
import { analyzeLabelData } from '@/lib/label-analysis';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    console.log('📸 Received image:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file temporarily
    const fileName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'labels');
    const filePath = join(uploadDir, fileName);

    console.log('💾 Saving to:', filePath);

    // Create directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    await writeFile(filePath, buffer);
    console.log('✅ File saved successfully');

    const imageUrl = `/uploads/labels/${fileName}`;

    // Create initial scan record
    const scan = await prisma.labelScan.create({
      data: {
        imageUrl,
        status: 'PROCESSING',
      },
    });

    console.log('🔄 Created scan record:', scan.id);

    // Perform OCR in background (we'll return scan ID immediately)
    processLabelScan(scan.id, filePath).catch((error) => {
      console.error('❌ Background processing failed:', error);
    });

    return NextResponse.json(
      {
        scanId: scan.id,
        message: 'Image uploaded successfully. Processing...',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Label scan error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

/**
 * Process label scan in background
 */
async function processLabelScan(scanId: string, imagePath: string) {
  console.log(`\n🚀 Starting OCR processing for scan ${scanId}`);
  console.log(`📂 Image path: ${imagePath}`);

  try {
    // Step 1: Extract text using OCR
    console.log('🔍 Step 1: Extracting text with OCR...');
    const { text, confidence } = await extractTextFromImage(imagePath);
    console.log(`✅ OCR complete! Confidence: ${confidence}%`);
    console.log(`📝 Extracted text (${text.length} chars):`, text.substring(0, 200));

    // Step 2: Parse label text
    console.log('🔍 Step 2: Parsing label text...');
    const parsed = parseLabelText(text);
    console.log(`✅ Found ${parsed.ingredients.length} ingredients`);
    console.log(`✅ Found ${Object.keys(parsed.nutritionFacts).length} nutrition facts`);

    // Step 3: Analyze ingredients and nutrition
    console.log('🔍 Step 3: Analyzing health impact...');
    const analysis = await analyzeLabelData({
      ingredients: parsed.ingredients,
      nutritionFacts: parsed.nutritionFacts,
      warnings: parsed.warnings,
    });
    console.log(`✅ Analysis complete! Score: ${analysis.overallScore}/100`);

    // Step 4: Update scan record with results
    console.log('🔍 Step 4: Saving results to database...');
    await prisma.labelScan.update({
      where: { id: scanId },
      data: {
        status: 'COMPLETED',
        ocrText: text,
        extractedData: {
          ingredients: parsed.ingredients,
          nutritionFacts: parsed.nutritionFacts,
          warnings: parsed.warnings,
          confidence,
        },
        productName: parsed.productName,
        healthScore: analysis.overallScore,
        analysisResult: analysis as Prisma.InputJsonValue,
      },
    });

    console.log(`✅ Scan ${scanId} completed successfully with score: ${analysis.overallScore}`);
  } catch (error: any) {
    console.error(`\n❌ Error processing scan ${scanId}:`);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Save detailed error information
    await prisma.labelScan.update({
      where: { id: scanId },
      data: {
        status: 'FAILED',
        ocrText: `Error: ${error.message}`,
        extractedData: {
          error: error.message,
          errorType: error.constructor.name,
          errorStack: error.stack,
        },
      },
    });

    console.log(`❌ Scan ${scanId} marked as FAILED`);
  }
}
