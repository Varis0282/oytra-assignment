import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import connectToDatabase from '@/lib/db';
import File from '@/models/File';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value;

    await connectToDatabase();

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = join(process.cwd(), UPLOAD_DIR, filename);

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save the file
    await writeFile(filePath, buffer);

    const getFileType = (file: any) => {
      console.log("🚀 => file:", file);
      if (file.name.endsWith('.pdf')) return 'pdf';
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) return 'excel';
      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) return 'word';
      if (file.name.endsWith('.txt')) return 'txt';
      return 'unknown';
    }

    const fileMetadata = {
      filename: filename,
      originalName: file.name,
      fileType: getFileType(file),
      size: file.size,
      path: filePath,
      userId: decoded.userId,
      uploadDate: new Date(),
    };

    const newFile = new File(fileMetadata);
    await newFile.save();

    return NextResponse.json(
      { message: 'File uploaded successfully', file: newFile },
      { status: 201 }
    );
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 