import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

// Tüm projeleri getir
export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 }); // En yeni projeler önce
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Projeler alınamadı' },
      { status: 500 }
    );
  }
}

// Yeni proje ekle
export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    const project = await Project.create(data);
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Proje eklenemedi' },
      { status: 500 }
    );
  }
} 