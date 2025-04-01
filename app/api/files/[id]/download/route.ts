import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import File from '@/models/File';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string };

    const fileId = params.id;
    const file = await File.findById(fileId).populate('userId', 'username');
    console.log("🚀 => file:", file);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const filePath = file.path; // Assuming the URL is stored in the `url` field

    return NextResponse.redirect(filePath, {
      headers: {
        'Content-Disposition': `attachment; filename="${file.originalName}"`,
        'Content-Type': file.fileType,
      },
    });

  } catch (error) {
    console.log("🚀 => error:", error);
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
