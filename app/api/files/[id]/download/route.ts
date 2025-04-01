import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { readFile } from 'fs/promises';
import { join } from 'path';
import File from '@/models/File';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { userId: string };

    // TODO: Get file metadata from database
    // For now, we'll use mock data
    const fileId = params.id;
    console.log("🚀 => fileId:", fileId);
    const file = await File.findById(fileId).populate('userId', 'username');
    console.log("🚀 => file:", file);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    const filePath = join(process.cwd(), UPLOAD_DIR, `${file.filename}`);

    try {
      const fileBuffer = await readFile(filePath);
      const headers = new Headers();
      headers.set('Content-Type', 'application/octet-stream');
      headers.set('Content-Disposition', 'attachment; filename=document.pdf');

      return new NextResponse(fileBuffer, {
        headers,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 