import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import cloudinary from '@/lib/cloudinary';
import connectToDatabase from '@/lib/db';
import File from '@/models/File';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const token = cookies().get('auth-token')?.value;

    await connectToDatabase();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    const formData = await request.formData();
    const file = formData.get('file') as unknown as { name: string; arrayBuffer: () => Promise<ArrayBuffer> };

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Invalid file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const size = buffer.byteLength;

    const originalName = file.name;
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    const publicId = `${timestamp}-${baseName}`;

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: publicId,
          folder: 'Oytra',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      ).end(buffer);
    });
    console.log("🚀 => result:", result);

    const getFileType = (filename: string) => {
      if (filename.endsWith('.pdf')) return 'pdf';
      if (/\.(xlsx|xls|csv)$/.test(filename)) return 'excel';
      if (/\.(docx|doc)$/.test(filename)) return 'word';
      if (filename.endsWith('.txt')) return 'txt';
      return 'unknown';
    };

    const downloadUrl = result.secure_url.replace(
      '/upload/',
      `/upload/fl_attachment:${encodeURIComponent(originalName)}/`
    );

    const fileMetadata = {
      filename: result.public_id,
      originalName,
      fileType: result.format || getFileType(originalName),
      size,
      path: result.secure_url,
      downloadUrl,
      userId: decoded.userId,
      uploadDate: new Date(),
    };

    const newFile = new File(fileMetadata);
    await newFile.save();

    return NextResponse.json({ message: 'Uploaded successfully', file: newFile }, { status: 201 });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}