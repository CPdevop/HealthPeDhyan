import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractTextFromImage, parseLabelText } from '@/lib/ocr';
import { analyzeLabelData } from '@/lib/label-analysis';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file temporarily
    const fileName = `${randomUUID()}-${file.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'labels');
    const filePath = join(uploadDir, fileName);

    // Create directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/labels/${fileName}`;

    // Create initial scan record
    const scan = await prisma.labelScan.create({
      data: {
        imageUrl,
        status: 'PROCESSING',
      },
    });

    // Perform OCR in background (we'll return scan ID immediately)
    processLabelScan(scan.id, filePath).catch(console.error);

    return NextResponse.json(
      {
        scanId: scan.id,
        message: 'Image uploaded successfully. Processing...',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Label scan error:', error);
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
  try {
    // Step 1: Extract text using OCR
    const { text, confidence } = await extractTextFromImage(imagePath);

    // Step 2: Parse label text
    const parsed = parseLabelText(text);

    // Step 3: Analyze ingredients and nutrition
    const analysis = await analyzeLabelData({
      ingredients: parsed.ingredients,
      nutritionFacts: parsed.nutritionFacts,
      warnings: parsed.warnings,
    });

    // Step 4: Update scan record with results
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
        analysisResult: analysis,
      },
    });

    console.log(`Label scan ${scanId} completed with score: ${analysis.overallScore}`);
  } catch (error) {
    console.error(`Error processing scan ${scanId}:`, error);

    await prisma.labelScan.update({
      where: { id: scanId },
      data: {
        status: 'FAILED',
      },
    });
  }
}
