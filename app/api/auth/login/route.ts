import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Servicio de login local no configurado. Use el servicio externo.' },
    { status: 501 }
  );
}
